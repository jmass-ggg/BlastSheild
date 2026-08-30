from app.schemas.impact import DependencyImpact
from app.schemas.risk import RiskBreakdown, RiskLevel, RiskReport


def risk_level(score: int) -> RiskLevel:
    if score <= 24:
        return "LOW"
    if score <= 49:
        return "MEDIUM"
    if score <= 74:
        return "HIGH"
    return "CRITICAL"


def _row_score(rows: int) -> int:
    if rows <= 0:
        return 0
    if rows <= 10:
        return 4
    if rows <= 100:
        return 8
    if rows <= 1_000:
        return 12
    if rows <= 10_000:
        return 16
    return 20


def _cascade_score(dependencies: list[DependencyImpact]) -> int:
    if not dependencies:
        return 0
    if any(item.effect == "BLOCK" for item in dependencies):
        return 25
    deletion_depths = [item.depth for item in dependencies if item.effect == "DELETE"]
    if deletion_depths:
        maximum_depth = max(deletion_depths)
        return 12 if maximum_depth == 1 else 18 if maximum_depth == 2 else 25
    if any(item.effect in {"SET_NULL", "SET_DEFAULT"} for item in dependencies):
        return 8
    return 0


def calculate_risk(
    *,
    operation: str,
    direct_rows: int,
    dependencies: list[DependencyImpact],
    has_where: bool,
    recoverable: bool,
) -> RiskReport:
    normalized_operation = operation.upper()
    operation_score = 20 if normalized_operation == "DELETE" else 10

    dependent_rows = sum(item.rows for item in dependencies)
    direct_score = _row_score(direct_rows)
    dependent_score = _row_score(dependent_rows)
    cascade_score = _cascade_score(dependencies)
    recoverability_score = 2 if recoverable else 10

    if normalized_operation == "DELETE" and not has_where:
        operation_score = 25
        direct_score = 20
        dependent_score = 20
        cascade_score = 25
        recoverability_score = 10

    breakdown = RiskBreakdown(
        operation=operation_score,
        direct_impact=direct_score,
        dependent_impact=dependent_score,
        cascade=cascade_score,
        recoverability=recoverability_score,
    )
    score = min(100, sum(breakdown.model_dump().values()))
    reasons = [
        f"{direct_rows:,} rows in the target table match the {normalized_operation} condition."
    ]
    if dependent_rows:
        reasons.append(f"{dependent_rows:,} correlated dependent rows were found.")
    if any(item.effect == "BLOCK" for item in dependencies):
        reasons.append("A RESTRICT or NO ACTION dependency can block the DELETE.")
    elif any(item.effect == "DELETE" for item in dependencies):
        reasons.append("One or more foreign-key paths propagate deletion by CASCADE.")
    if normalized_operation == "DELETE" and not has_where:
        reasons.append("The DELETE has no WHERE clause and targets the entire table.")

    return RiskReport(
        score=score,
        level=risk_level(score),
        breakdown=breakdown,
        reasons=reasons,
    )
