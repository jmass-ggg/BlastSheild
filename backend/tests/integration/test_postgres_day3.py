import os

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import ExecutionSettings, Settings
from app.core.errors import ApprovalRequiredError, ExecutionFailedError
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalyzeRequest
from app.schemas.execution import StaleExecutionResponse
from app.services.analysis_pipeline import AnalysisPipeline
from app.services.blastshield_analyzer import BlastShieldAnalyzer
from app.services.execution_coordinator import ExecutionCoordinator
from app.services.executor import Executor
from app.services.revalidator import Revalidator

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
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(rejected.analysis_id)
    assert _counts(analysis_engine) == starting_counts

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
    repository.claim_approved_for_execution(claimed.analysis_id)
    with pytest.raises(ExecutionFailedError):
        repository.claim_approved_for_execution(claimed.analysis_id)
    repository.mark_failed(
        claimed.analysis_id,
        code="TEST_CLEANUP",
        message="Claim concurrency verified.",
    )

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

    for engine in [analysis_engine, app_engine, execution_engine, admin_engine]:
        engine.dispose()
