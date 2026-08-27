import uuid

from app.core.errors import BlastShieldError, ExecutionFailedError
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.execution import ExecutionResponse, StaleExecutionResponse
from app.services.executor import Executor
from app.services.revalidator import Revalidator


class ExecutionCoordinator:
    def __init__(
        self,
        *,
        repository: AnalysisRepository | None = None,
        revalidator: Revalidator | None = None,
        executor: Executor | None = None,
    ) -> None:
        self._repository = repository or AnalysisRepository()
        self._revalidator = revalidator or Revalidator()
        self._executor = executor or Executor()

    def execute(
        self, analysis_id: uuid.UUID
    ) -> ExecutionResponse | StaleExecutionResponse:
        record = self._repository.claim_approved_for_execution(analysis_id)
        try:
            is_valid = self._revalidator.revalidate(record)
        except BlastShieldError as exc:
            self._repository.mark_failed(
                analysis_id,
                code=exc.code,
                message=exc.message,
            )
            raise
        except Exception as exc:
            self._repository.mark_failed(
                analysis_id,
                code="EXECUTION_FAILED",
                message="Revalidation failed.",
            )
            raise ExecutionFailedError("Revalidation failed; nothing was executed.") from exc

        if not is_valid:
            self._repository.mark_stale(analysis_id)
            return StaleExecutionResponse()

        try:
            affected_rows = self._executor.execute(record)
        except BlastShieldError as exc:
            self._repository.mark_failed(
                analysis_id,
                code=exc.code,
                message=exc.message,
            )
            raise
        except Exception as exc:
            self._repository.mark_failed(
                analysis_id,
                code="EXECUTION_FAILED",
                message="The approved DELETE failed and was rolled back.",
            )
            raise ExecutionFailedError() from exc

        try:
            executed = self._repository.mark_executed(
                analysis_id,
                affected_rows=affected_rows,
            )
        except Exception as exc:
            raise ExecutionFailedError(
                "The DELETE committed but status persistence failed; manual "
                "reconciliation is required."
            ) from exc

        if executed.executed_at is None:
            raise ExecutionFailedError("Execution timestamp was not persisted.")
        return ExecutionResponse(
            analysis_id=executed.id,
            executed=True,
            status=executed.status,
            affected_rows=affected_rows,
            executed_at=executed.executed_at,
        )
