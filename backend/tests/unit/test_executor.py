import pytest

from app.core.errors import ExecutionFailedError, MultipleStatementsError
from app.db.models import AnalysisRecord
from app.services.executor import Executor


def stored_record(sql: str, *, schema: str = "public") -> AnalysisRecord:
    return AnalysisRecord(
        normalized_sql=sql,
        operation="DELETE",
        target_schema=schema,
        target_table="users",
    )


def test_executor_rejects_schema_metadata_mismatch_before_database_access() -> None:
    with pytest.raises(ExecutionFailedError):
        Executor().execute(stored_record("DELETE FROM audit.users WHERE id = 1"))


def test_executor_rejects_multiple_stored_statements_before_database_access() -> None:
    with pytest.raises(MultipleStatementsError):
        Executor().execute(
            stored_record("DELETE FROM users WHERE id = 1; DELETE FROM users")
        )
