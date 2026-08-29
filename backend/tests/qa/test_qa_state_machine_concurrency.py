import os
import uuid
from concurrent.futures import ThreadPoolExecutor
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

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


def _get_counts(engine) -> dict[str, int]:
    with engine.connect() as conn:
        return {
            table: int(conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one())
            for table in ["users", "orders", "payments", "subscriptions", "sessions"]
        }


def test_state_transition_matrix(analyzer_engine, app_engine, execution_engine):
    """Verify invalid state transitions are rejected according to the state machine."""
    repo = AnalysisRepository(sessionmaker(bind=app_engine, expire_on_commit=False))
    settings = Settings()
    pipeline = AnalysisPipeline(analysis_engine=analyzer_engine, settings=settings)
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analyzer_engine,
        repository=repo,
        settings=settings,
        pipeline=pipeline,
    )
    coordinator = ExecutionCoordinator(
        repository=repo,
        revalidator=Revalidator(pipeline),
        executor=Executor(engine=execution_engine),
    )

    req = AnalyzeRequest(sql="DELETE FROM users WHERE id = 10", source="qa_state_machine")

    # 1. PENDING -> REJECTED -> Cannot APPROVE
    a1 = analyzer.analyze(req)
    repo.reject_pending(a1.analysis_id, actor="dba", reason="not needed")
    with pytest.raises(InvalidStateError):
        repo.approve_pending(a1.analysis_id)
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(a1.analysis_id)

    # 2. PENDING -> APPROVED -> Cannot REJECT
    a2 = analyzer.analyze(req)
    repo.approve_pending(a2.analysis_id, actor="dba", reason="approved")
    with pytest.raises(InvalidStateError):
        repo.reject_pending(a2.analysis_id)

    # 3. PENDING -> APPROVED -> EXECUTED -> Cannot APPROVE, Cannot REJECT, Cannot EXECUTE again
    res = coordinator.execute(a2.analysis_id)
    assert res.executed is True
    with pytest.raises(InvalidStateError):
        repo.approve_pending(a2.analysis_id)
    with pytest.raises(InvalidStateError):
        repo.reject_pending(a2.analysis_id)
    with pytest.raises(ApprovalRequiredError):
        coordinator.execute(a2.analysis_id)


def test_stale_detection_on_data_mutation(analyzer_engine, app_engine, execution_engine):
    """Verify any modification to relevant data after analysis marks execution as STALE."""
    repo = AnalysisRepository(sessionmaker(bind=app_engine, expire_on_commit=False))
    settings = Settings()
    pipeline = AnalysisPipeline(analysis_engine=analyzer_engine, settings=settings)
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analyzer_engine,
        repository=repo,
        settings=settings,
        pipeline=pipeline,
    )
    coordinator = ExecutionCoordinator(
        repository=repo,
        revalidator=Revalidator(pipeline),
        executor=Executor(engine=execution_engine),
    )

    initial_counts = _get_counts(analyzer_engine)

    # Analyze target
    req = AnalyzeRequest(
        sql="DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';",
        source="qa_stale",
    )
    analysis = analyzer.analyze(req)
    repo.approve_pending(analysis.analysis_id, actor="lead", reason="OK")

    # Mutate data: Insert a new user matching the predicate
    with execution_engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (id, email, full_name, last_login, created_at) "
                "VALUES (9999, 'drift@qa.test', 'Drift User', NOW() - INTERVAL '3 years', NOW())"
            )
        )

    # Execute should detect fingerprint mismatch and refuse execution
    result = coordinator.execute(analysis.analysis_id)
    assert isinstance(result, StaleExecutionResponse)
    assert result.status == "STALE"

    record = repo.get(analysis.analysis_id)
    assert record.status == "STALE"

    # Verify no deletion happened on users
    current_counts = _get_counts(analyzer_engine)
    assert current_counts["users"] == initial_counts["users"] + 1

    # Clean up drift row
    with execution_engine.begin() as conn:
        conn.execute(text("DELETE FROM users WHERE id = 9999"))


def test_concurrency_execution_locking(analyzer_engine, app_engine, execution_engine):
    """Verify that multiple simultaneous execution requests cannot execute twice."""
    repo = AnalysisRepository(sessionmaker(bind=app_engine, expire_on_commit=False))
    settings = Settings()
    pipeline = AnalysisPipeline(analysis_engine=analyzer_engine, settings=settings)
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analyzer_engine,
        repository=repo,
        settings=settings,
        pipeline=pipeline,
    )
    coordinator = ExecutionCoordinator(
        repository=repo,
        revalidator=Revalidator(pipeline),
        executor=Executor(engine=execution_engine),
    )

    req = AnalyzeRequest(sql="DELETE FROM users WHERE id = 50", source="qa_concurrency")
    analysis = analyzer.analyze(req)
    repo.approve_pending(analysis.analysis_id, actor="lead", reason="OK")

    def try_execute():
        try:
            return coordinator.execute(analysis.analysis_id).status
        except Exception as e:
            return type(e).__name__

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(try_execute) for _ in range(4)]
        results = [f.result() for f in futures]

    # Exactly 1 should be EXECUTED, others should fail
    executed_count = results.count("EXECUTED")
    assert executed_count == 1, f"Expected exactly 1 execution, got results: {results}"


def test_execution_atomic_rollback_on_failure(analyzer_engine, app_engine, execution_engine, admin_engine):
    """Verify that a failing execution transaction rolls back completely."""
    repo = AnalysisRepository(sessionmaker(bind=app_engine, expire_on_commit=False))
    settings = Settings()
    pipeline = AnalysisPipeline(analysis_engine=analyzer_engine, settings=settings)
    analyzer = BlastShieldAnalyzer(
        analysis_engine=analyzer_engine,
        repository=repo,
        settings=settings,
        pipeline=pipeline,
    )

    initial_counts = _get_counts(analyzer_engine)

    # Attach a trigger that raises an error on DELETE
    with admin_engine.begin() as conn:
        conn.execute(
            text(
                "CREATE OR REPLACE FUNCTION qa_fail_trigger() RETURNS trigger AS $$ "
                "BEGIN RAISE EXCEPTION 'SIMULATED_DB_ERROR'; END; $$ LANGUAGE plpgsql;"
            )
        )
        conn.execute(
            text(
                "CREATE TRIGGER trg_qa_fail BEFORE DELETE ON users "
                "FOR EACH ROW EXECUTE FUNCTION qa_fail_trigger();"
            )
        )

    try:
        req = AnalyzeRequest(sql="DELETE FROM users WHERE id = 70", source="qa_rollback")
        analysis = analyzer.analyze(req)
        repo.approve_pending(analysis.analysis_id, actor="lead", reason="OK")

        coordinator = ExecutionCoordinator(
            repository=repo,
            revalidator=Revalidator(pipeline),
            executor=Executor(engine=execution_engine),
        )

        with pytest.raises(ExecutionFailedError):
            coordinator.execute(analysis.analysis_id)

        # Status in repo is FAILED
        assert repo.get(analysis.analysis_id).status == "FAILED"

        # Verify DB counts are completely unchanged
        assert _get_counts(analyzer_engine) == initial_counts
    finally:
        with admin_engine.begin() as conn:
            conn.execute(text("DROP TRIGGER IF EXISTS trg_qa_fail ON users;"))
            conn.execute(text("DROP FUNCTION IF EXISTS qa_fail_trigger();"))
