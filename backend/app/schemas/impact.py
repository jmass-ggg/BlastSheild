from typing import Literal

from pydantic import BaseModel

Measurement = Literal["EXACT", "ESTIMATED"]
DependencyEffect = Literal["DELETE", "SET_NULL", "SET_DEFAULT", "BLOCK", "NONE"]


class DirectImpact(BaseModel):
    table: str
    rows: int
    measurement: Measurement = "EXACT"


class DependencyImpact(BaseModel):
    table: str
    rows: int
    depth: int
    path: list[str]
    on_delete: str
    effect: DependencyEffect
    measurement: Measurement


class ImpactSummary(BaseModel):
    direct_rows: int
    dependent_rows: int
    total_rows: int
