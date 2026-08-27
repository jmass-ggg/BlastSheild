import uuid

from fastapi import APIRouter

from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.approval import ApprovalRequest, ApprovalTransitionResponse

router = APIRouter(tags=["approvals"])


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
    return ApprovalTransitionResponse(
        analysis_id=record.id,
        status=record.status,
        rejected_at=record.rejected_at,
    )
