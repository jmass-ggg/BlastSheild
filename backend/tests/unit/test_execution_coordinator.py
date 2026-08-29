import uuid
from datetime import datetime, timezone

from app.db.models import AnalysisRecord
from app.schemas.execution import StaleExecutionResponse
from app.services.execution_coordinator import ExecutionCoordinator


def record() -> AnalysisRecord:
    return AnalysisRecord(
        id=uuid.uuid4(),
        original_sql="DELETE FROM users WHERE id = 1",
        normalized_sql="DELETE FROM users WHERE id = 1",
        operation="DELETE",
        target_schema="public",
        target_table="users",
        source="test",
        status="APPROVED",
        report={},
        fingerprint="fingerprint",
    )


class FakeRepository:
    def __init__(self, item: AnalysisRecord) -> None:
        self.item = item
        self.stale = False
        self.executed = False

    def claim_approved_for_execution(self, _analysis_id):
        return self.item

    def mark_stale(self, _analysis_id):
        self.stale = True
        return self.item

    def mark_executed(self, _analysis_id, *, affected_rows):
        self.executed = True
        self.item.status = "EXECUTED"
        self.item.executed_at = datetime.now(timezone.utc)
        self.item.execution_affected_rows = affected_rows
        return self.item

    def mark_failed(self, _analysis_id, *, code, message):
        raise AssertionError(f"Unexpected failure: {code} {message}")


class FakeRevalidator:
    def __init__(self, valid: bool) -> None:
        self.valid = valid

    def revalidate(self, _record):
        return self.valid


class FakeExecutor:
    def __init__(self) -> None:
        self.called = False

    def execute(self, _record):
        self.called = True
        return 1


def test_stale_revalidation_never_calls_executor() -> None:
    item = record()
    repository = FakeRepository(item)
    executor = FakeExecutor()
    coordinator = ExecutionCoordinator(
        repository=repository,
        revalidator=FakeRevalidator(False),
        executor=executor,
    )

    result = coordinator.execute(item.id)

    assert isinstance(result, StaleExecutionResponse)
    assert repository.stale is True
    assert executor.called is False


def test_valid_revalidation_executes_and_persists_result() -> None:
    item = record()
    repository = FakeRepository(item)
    executor = FakeExecutor()
    coordinator = ExecutionCoordinator(
        repository=repository,
        revalidator=FakeRevalidator(True),
        executor=executor,
    )

    result = coordinator.execute(item.id)

    assert result.executed is True
    assert result.status == "EXECUTED"
    assert result.affected_rows == 1
    assert repository.executed is True
    assert executor.called is True
