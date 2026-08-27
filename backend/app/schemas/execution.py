import uuid
from datetime import datetime

from pydantic import BaseModel


class ExecutionResponse(BaseModel):
    analysis_id: uuid.UUID
    executed: bool
    status: str
    affected_rows: int
    executed_at: datetime


class StaleExecutionResponse(BaseModel):
    executed: bool = False
    status: str = "STALE"
    code: str = "ANALYSIS_STALE"
    message: str = (
        "Production state changed after approval. Re-analysis is required."
    )

