from sqlalchemy import Engine, text
from sqlalchemy.exc import DBAPIError

from app.core.config import ExecutionSettings
from app.core.errors import ExecutionFailedError
from app.db.execution_connection import execution_transaction
from app.db.models import AnalysisRecord
from app.services.sql_parser import parse_sql


class Executor:
    def __init__(
        self,
        *,
        engine: Engine | None = None,
        settings: ExecutionSettings | None = None,
    ) -> None:
        self._engine = engine
        self._settings = settings

    def execute(self, record: AnalysisRecord) -> int:
        parsed = parse_sql(record.normalized_sql)
        if parsed.operation != "DELETE":
            raise ExecutionFailedError("Stored operation is not an executable DELETE.")
        if (
            parsed.operation != record.operation
            or parsed.schema_name != record.target_schema
            or parsed.table != record.target_table
        ):
            raise ExecutionFailedError(
                "Stored SQL does not match the approved analysis metadata."
            )

        try:
            with execution_transaction(
                self._engine,
                settings=self._settings,
            ) as connection:
                result = connection.execute(text(parsed.normalized_sql))
                affected_rows = max(0, int(result.rowcount or 0))
        except DBAPIError as exc:
            raise ExecutionFailedError(
                "The approved DELETE failed and was rolled back."
            ) from exc
        return affected_rows
