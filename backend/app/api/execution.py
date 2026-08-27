import uuid

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.execution import ExecutionResponse, StaleExecutionResponse
from app.services.execution_coordinator import ExecutionCoordinator

router = APIRouter(tags=["execution"])


@router.post(
    "/analyses/{analysis_id}/execute",
    response_model=ExecutionResponse,
    responses={409: {"model": StaleExecutionResponse}},
)
def execute_analysis(analysis_id: uuid.UUID):
    result = ExecutionCoordinator().execute(analysis_id)
    if isinstance(result, StaleExecutionResponse):
        return JSONResponse(status_code=409, content=result.model_dump(mode="json"))
    return result

