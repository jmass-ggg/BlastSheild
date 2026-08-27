from typing import Literal

from pydantic import BaseModel

RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]


class RiskBreakdown(BaseModel):
    operation: int
    direct_impact: int
    dependent_impact: int
    cascade: int
    business_impact: int
    recoverability: int


class RiskReport(BaseModel):
    score: int
    level: RiskLevel
    breakdown: RiskBreakdown
    reasons: list[str]

