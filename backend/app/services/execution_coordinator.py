import logging
import uuid
from time import perf_counter

from app.core.errors import BlastShieldError, ExecutionFailedError
from app.core.logging import log_lifecycle
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.execution import ExecutionResponse, StaleExecutionResponse
from app.services.executor import Executor
from app.services.revalidator import Revalidator

logger = logging.getLogger(__name__)


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
        started = perf_counter()
        record = self._repository.claim_approved_for_execution(analysis_id)
        log_lifecycle(
            logger,
            analysis_id=analysis_id,
            event="execution_claimed",
            status_before="APPROVED",
            status_after="APPROVED",
        )
        try:
            is_valid = self._revalidator.revalidate(record)
        except BlastShieldError as exc:
            self._repository.mark_failed(
                analysis_id,
                code=exc.code,
                message=exc.message,
            )
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="revalidation_failed",
                status_before="APPROVED",
                status_after="FAILED",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code=exc.code,
            )
            raise
        except Exception as exc:
            self._repository.mark_failed(
                analysis_id,
                code="EXECUTION_FAILED",
                message="Revalidation failed.",
            )
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="revalidation_failed",
                status_before="APPROVED",
                status_after="FAILED",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code="EXECUTION_FAILED",
            )
            raise ExecutionFailedError("Revalidation failed; nothing was executed.") from exc

        if not is_valid:
            self._repository.mark_stale(analysis_id)
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="revalidation_stale",
                status_before="APPROVED",
                status_after="STALE",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code="ANALYSIS_STALE",
            )
            return StaleExecutionResponse()

        try:
            affected_rows = self._executor.execute(record)
        except BlastShieldError as exc:
            self._repository.mark_failed(
                analysis_id,
                code=exc.code,
                message=exc.message,
            )
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="execution_failed",
                status_before="APPROVED",
                status_after="FAILED",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code=exc.code,
            )
            raise
        except Exception as exc:
            self._repository.mark_failed(
                analysis_id,
                code="EXECUTION_FAILED",
                message="The approved DELETE failed and was rolled back.",
            )
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="execution_failed",
                status_before="APPROVED",
                status_after="FAILED",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code="EXECUTION_FAILED",
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
        log_lifecycle(
            logger,
            analysis_id=analysis_id,
            event="execution_completed",
            status_before="APPROVED",
            status_after="EXECUTED",
            duration_ms=(perf_counter() - started) * 1_000,
        )
        return ExecutionResponse(
            analysis_id=executed.id,
            executed=True,
            status=executed.status,
            affected_rows=affected_rows,
            executed_at=executed.executed_at,
        )
