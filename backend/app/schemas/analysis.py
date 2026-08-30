import uuid

from pydantic import BaseModel, Field

from app.schemas.graph import ReportGraph
from app.schemas.impact import DependencyImpact, ImpactSummary
from app.schemas.risk import RiskLevel, RiskReport


class AnalyzeRequest(BaseModel):
    sql: str = Field(min_length=1)
    source: str = Field(default="ui", min_length=1, max_length=100)
    reason: str | None = Field(default=None, max_length=2_000)


class ActionReport(BaseModel):
    operation: str
    table: str
    has_where: bool


class SaferAlternative(BaseModel):
    available: bool
    sql: str | None = None
    risk_score: int | None = None
    risk_level: RiskLevel | None = None


class TimelineItem(BaseModel):
    key: str
    label: str
    status: str


class AnalysisResponse(BaseModel):
    analysis_id: uuid.UUID
    status: str
    sql: str | None = None
    action: ActionReport
    impact: ImpactSummary
    dependencies: list[DependencyImpact]
    risk: RiskReport
    graph: ReportGraph
    safer_alternative: SaferAlternative
    requires_approval: bool
    timeline: list[TimelineItem]
