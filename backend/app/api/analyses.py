import uuid

from fastapi import APIRouter, Query

from app.core.errors import NotFoundError
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalysisResponse

router = APIRouter(tags=["analyses"])


@router.get("/analyses", response_model=list[AnalysisResponse])
def list_analyses(limit: int = Query(default=100, ge=1, le=100)) -> list[AnalysisResponse]:
    records = AnalysisRepository().list_completed(limit=limit)
    return [AnalysisResponse.model_validate(record.report) for record in records]


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: uuid.UUID) -> AnalysisResponse:
    record = AnalysisRepository().get(analysis_id)
    if not record.report:
        raise NotFoundError("The analysis report is not available.")
    return AnalysisResponse.model_validate(record.report)

