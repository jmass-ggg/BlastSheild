from fastapi import APIRouter

from app.schemas.analysis import AnalysisResponse, AnalyzeRequest
from app.services.blastshield_analyzer import BlastShieldAnalyzer

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalyzeRequest) -> AnalysisResponse:
    return BlastShieldAnalyzer().analyze(request)

