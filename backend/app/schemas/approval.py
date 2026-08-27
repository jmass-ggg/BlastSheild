import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ApprovalRequest(BaseModel):
    actor: str | None = Field(default=None, max_length=320)
    reason: str | None = Field(default=None, max_length=2_000)


class ApprovalTransitionResponse(BaseModel):
    analysis_id: uuid.UUID
    status: str
    approved_at: datetime | None = None
    rejected_at: datetime | None = None

