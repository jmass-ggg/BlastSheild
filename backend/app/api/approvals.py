import logging
import uuid

from fastapi import APIRouter

from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.approval import ApprovalRequest, ApprovalTransitionResponse
from app.core.logging import log_lifecycle

router = APIRouter(tags=["approvals"])
logger = logging.getLogger(__name__)


@router.post(
    "/analyses/{analysis_id}/approve",
    response_model=ApprovalTransitionResponse,
)
def approve_analysis(
    analysis_id: uuid.UUID,
    request: ApprovalRequest | None = None,
) -> ApprovalTransitionResponse:
    payload = request or ApprovalRequest()
    record = AnalysisRepository().approve_pending(
        analysis_id,
        actor=payload.actor,
        reason=payload.reason,
    )
    log_lifecycle(
        logger,
        analysis_id=record.id,
        event="analysis_approved",
        status_before="PENDING_APPROVAL",
        status_after="APPROVED",
    )
    return ApprovalTransitionResponse(
        analysis_id=record.id,
        status=record.status,
        approved_at=record.approved_at,
    )


@router.post(
    "/analyses/{analysis_id}/reject",
    response_model=ApprovalTransitionResponse,
)
def reject_analysis(
    analysis_id: uuid.UUID,
    request: ApprovalRequest | None = None,
) -> ApprovalTransitionResponse:
    payload = request or ApprovalRequest()
    record = AnalysisRepository().reject_pending(
        analysis_id,
        actor=payload.actor,
        reason=payload.reason,
    )
    log_lifecycle(
        logger,
        analysis_id=record.id,
        event="analysis_rejected",
        status_before="PENDING_APPROVAL",
        status_after="REJECTED",
    )
    return ApprovalTransitionResponse(
        analysis_id=record.id,
        status=record.status,
        rejected_at=record.rejected_at,
    )
