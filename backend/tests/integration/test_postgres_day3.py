import os
import uuid
from concurrent.futures import ThreadPoolExecutor

import pytest
from app.core.config import ExecutionSettings, Settings
from app.core.errors import (
    ApprovalRequiredError,
    ExecutionFailedError,
    InvalidStateError,
    NotFoundError,
)
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalyzeRequest
from app.schemas.execution import StaleExecutionResponse
from app.services.analysis_pipeline import AnalysisPipeline
from app.services.blastshield_analyzer import BlastShieldAnalyzer
from app.services.execution_coordinator import ExecutionCoordinator
from app.services.executor import Executor
from app.services.revalidator import Revalidator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

ANALYSIS_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_DATABASE_URL")
APP_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_APP_DATABASE_URL")
EXECUTION_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_EXECUTION_DATABASE_URL")
ADMIN_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_ADMIN_DATABASE_URL")
pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not all(
            [
                ANALYSIS_DATABASE_URL,
                APP_DATABASE_URL,
                EXECUTION_DATABASE_URL,
                ADMIN_DATABASE_URL,
            ]
        ),
        reason="Day 3 database URLs are not configured",
    ),
]


def _counts(engine) -> dict[str, int]:
    with engine.connect() as connection:
        return {
            table: int(
                connection.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            )
            for table in ["users", "orders", "payments", "subscriptions", "sessions"]
        }


def test_complete_approval_stale_execution_and_rollback_lifecycle() -> None:
    analysis_engine = create_engine(ANALYSIS_DATABASE_URL, pool_pre_ping=True)
    app_engine = create_engine(APP_DATABASE_URL, pool_pre_ping=True)
    execution_engine = create_engine(EXECUTION_DATABASE_URL, pool_pre_ping=True)
    admin_engine = create_engine(ADMIN_DATABASE_URL, pool_pre_ping=True)
    repository = AnalysisRepository(
        sessionmaker(bind=app_engine, expire_on_commit=False, autoflush=False)
    )
    settings = Settings(
        analysis_database_url=ANALYSIS_DATABASE_URL,
        app_database_url=APP_DATABASE_URL,
    )
    pipeline = AnalysisPipeline(analysis_engine=analysis_engine, settings=settings)
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analysis_engine,
        repository=repository,
        settings=settings,
        pipeline=pipeline,
    )
    coordinator = ExecutionCoordinator(
        repository=repository,
        revalidator=Revalidator(pipeline),
        executor=Executor(
            engine=execution_engine,
            settings=ExecutionSettings(
                execution_database_url=EXECUTION_DATABASE_URL,
            ),
        ),
    )

    request = AnalyzeRequest(
        sql="DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
        source="day3-integration",
    )
    starting_counts = _counts(analysis_engine)

    pending = analyzer.analyze(request)
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(pending.analysis_id)
    assert _counts(analysis_engine) == starting_counts

    rejected = analyzer.analyze(request)
    repository.reject_pending(rejected.analysis_id, actor="human", reason="No")
    with pytest.raises(InvalidStateError):
        repository.approve_pending(rejected.analysis_id)
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(rejected.analysis_id)
    assert _counts(analysis_engine) == starting_counts

    with pytest.raises(NotFoundError):
        repository.get(uuid.uuid4())

    direct_stale = analyzer.analyze(request)
    repository.approve_pending(direct_stale.analysis_id)
    with execution_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO users "
                "(id, email, full_name, last_login, created_at) VALUES "
                "(1001, 'day4-direct-stale@example.test', 'Drift User', "
                "NOW() - INTERVAL '3 years', NOW())"
            )
        )
    direct_result = coordinator.execute(direct_stale.analysis_id)
    assert isinstance(direct_result, StaleExecutionResponse)
    assert _counts(analysis_engine)["users"] == starting_counts["users"] + 1
    with execution_engine.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id = 1001"))

    graph_stale = analyzer.analyze(request)
    repository.approve_pending(graph_stale.analysis_id)
    with admin_engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE day4_graph_drift ("
                "id BIGSERIAL PRIMARY KEY, "
                "user_id BIGINT REFERENCES users(id) ON DELETE SET NULL)"
            )
        )
        connection.execute(
            text("GRANT SELECT ON day4_graph_drift TO blastshield_analyzer")
        )
    try:
        graph_result = coordinator.execute(graph_stale.analysis_id)
        assert isinstance(graph_result, StaleExecutionResponse)
    finally:
        with admin_engine.begin() as connection:
            connection.execute(text("DROP TABLE day4_graph_drift"))

    stale = analyzer.analyze(request)
    repository.approve_pending(stale.analysis_id, actor="human", reason="Reviewed")
    assert _counts(analysis_engine) == starting_counts
    with execution_engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO sessions (user_id, token_hash, expires_at) "
                "VALUES (1, 'day3-stale-session', NOW() + INTERVAL '1 day')"
            )
        )
    stale_result = coordinator.execute(stale.analysis_id)
    assert isinstance(stale_result, StaleExecutionResponse)
    assert repository.get(stale.analysis_id).status == "STALE"
    assert _counts(analysis_engine)["users"] == starting_counts["users"]
    with execution_engine.begin() as connection:
        connection.execute(
            text("DELETE FROM sessions WHERE token_hash = 'day3-stale-session'")
        )

    claimed = analyzer.analyze(
        AnalyzeRequest(sql="DELETE FROM users WHERE id = -1", source="claim-test")
    )
    repository.approve_pending(claimed.analysis_id)
    with ThreadPoolExecutor(max_workers=2) as pool:
        outcomes = list(
            pool.map(
                lambda _index: _claim_outcome(repository, claimed.analysis_id),
                range(2),
            )
        )
    assert sorted(outcomes) == ["CLAIMED", "EXECUTION_FAILED"]
    repository.mark_failed(
        claimed.analysis_id,
        code="TEST_CLEANUP",
        message="Claim concurrency verified.",
    )

    with admin_engine.begin() as connection:
        connection.execute(
            text(
                "CREATE FUNCTION day4_slow_delete() RETURNS trigger "
                "LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_sleep(1); RETURN OLD; END $$"
            )
        )
        connection.execute(
            text(
                "CREATE TRIGGER day4_slow_delete_trigger BEFORE DELETE ON users "
                "FOR EACH ROW EXECUTE FUNCTION day4_slow_delete()"
            )
        )
    try:
        timeout_report = analyzer.analyze(
            AnalyzeRequest(sql="DELETE FROM users WHERE id = 1", source="timeout-test")
        )
        repository.approve_pending(timeout_report.analysis_id)
        timeout_coordinator = ExecutionCoordinator(
            repository=repository,
            revalidator=Revalidator(pipeline),
            executor=Executor(
                engine=execution_engine,
                settings=ExecutionSettings(
                    execution_database_url=EXECUTION_DATABASE_URL,
                    execution_statement_timeout_ms=25,
                ),
            ),
        )
        with pytest.raises(ExecutionFailedError):
            timeout_coordinator.execute(timeout_report.analysis_id)
        assert repository.get(timeout_report.analysis_id).status == "FAILED"
        assert _counts(analysis_engine)["users"] == starting_counts["users"]
    finally:
        with admin_engine.begin() as connection:
            connection.execute(
                text("DROP TRIGGER IF EXISTS day4_slow_delete_trigger ON users")
            )
            connection.execute(text("DROP FUNCTION IF EXISTS day4_slow_delete()"))

    approved = analyzer.analyze(request)
    repository.approve_pending(approved.analysis_id, actor="human")
    result = coordinator.execute(approved.analysis_id)
    assert result.executed is True
    assert result.affected_rows == 40
    assert repository.get(approved.analysis_id).status == "EXECUTED"
    assert _counts(analysis_engine) == {
        "users": 60,
        "orders": 150,
        "payments": 150,
        "subscriptions": 30,
        "sessions": 48,
    }
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(approved.analysis_id)

    with admin_engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE day3_restrict_children ("
                "id BIGSERIAL PRIMARY KEY, "
                "user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT)"
            )
        )
        connection.execute(
            text("INSERT INTO day3_restrict_children (user_id) VALUES (41)")
        )
        connection.execute(
            text("GRANT SELECT ON day3_restrict_children TO blastshield_analyzer")
        )
    try:
        rollback_report = analyzer.analyze(
            AnalyzeRequest(sql="DELETE FROM users WHERE id = 41", source="rollback-test")
        )
        repository.approve_pending(rollback_report.analysis_id)
        with pytest.raises(ExecutionFailedError):
            coordinator.execute(rollback_report.analysis_id)
        assert repository.get(rollback_report.analysis_id).status == "FAILED"
        with analysis_engine.connect() as connection:
            assert (
                connection.execute(
                    text("SELECT COUNT(*) FROM users WHERE id = 41")
                ).scalar_one()
                == 1
            )
    finally:
        with admin_engine.begin() as connection:
            connection.execute(text("DROP TABLE IF EXISTS day3_restrict_children"))
            connection.execute(text("""
                TRUNCATE public.users RESTART IDENTITY CASCADE;

                INSERT INTO public.users (email, full_name, last_login, created_at)
                SELECT
                    'user' || number || '@example.test',
                    'Demo User ' || number,
                    CASE
                        WHEN number <= 40 THEN NOW() - INTERVAL '3 years' - number * INTERVAL '1 day'
                        ELSE NOW() - number * INTERVAL '3 days'
                    END,
                    NOW() - number * INTERVAL '10 days'
                FROM generate_series(1, 100) AS number;

                INSERT INTO public.orders (user_id, status, total_amount, created_at)
                SELECT
                    users.id,
                    CASE WHEN order_number % 4 = 0 THEN 'refunded' ELSE 'completed' END,
                    (25 + users.id * order_number)::NUMERIC(12, 2),
                    users.created_at + order_number * INTERVAL '1 day'
                FROM public.users
                CROSS JOIN LATERAL generate_series(1, (users.id % 4 + 1)::INTEGER) AS order_number;

                INSERT INTO public.payments (order_id, status, amount, created_at)
                SELECT
                    orders.id,
                    CASE WHEN orders.status = 'refunded' THEN 'refunded' ELSE 'captured' END,
                    orders.total_amount,
                    orders.created_at + INTERVAL '1 hour'
                FROM public.orders;

                INSERT INTO public.subscriptions (user_id, status, monthly_price, created_at)
                SELECT
                    users.id,
                    CASE WHEN users.id % 3 = 0 THEN 'cancelled' ELSE 'active' END,
                    (19 + (users.id % 4) * 10)::NUMERIC(12, 2),
                    users.created_at
                FROM public.users
                WHERE users.id % 2 = 0;

                INSERT INTO public.sessions (user_id, token_hash, expires_at, created_at)
                SELECT
                    users.id,
                    md5('blastshield-demo-session-' || users.id),
                    NOW() + INTERVAL '7 days',
                    NOW() - INTERVAL '1 hour'
                FROM public.users
                WHERE users.id % 5 <> 0;
            """))

    for engine in [analysis_engine, app_engine, execution_engine, admin_engine]:
        engine.dispose()


def _claim_outcome(repository: AnalysisRepository, analysis_id: uuid.UUID) -> str:
    try:
        repository.claim_approved_for_execution(analysis_id)
        return "CLAIMED"
    except ExecutionFailedError:
        return "EXECUTION_FAILED"
