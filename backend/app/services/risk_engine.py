from app.schemas.impact import BusinessImpact, DependencyImpact
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


def _business_score(impact: BusinessImpact) -> int:
    if impact.active_subscriptions <= 0 and impact.mrr_at_risk <= 0:
        return 0
    if impact.mrr_at_risk < 100:
        return 3
    if impact.mrr_at_risk < 1_000:
        return 6
    if impact.mrr_at_risk < 10_000:
        return 10
    return 15


def _cascade_score(dependencies: list[DependencyImpact]) -> int:
    if not dependencies:
        return 0
    if any(item.effect == "BLOCK" for item in dependencies):
        return 15
    deletion_depths = [item.depth for item in dependencies if item.effect == "DELETE"]
    if deletion_depths:
        maximum_depth = max(deletion_depths)
        return 8 if maximum_depth == 1 else 12 if maximum_depth == 2 else 15
    if any(item.effect in {"SET_NULL", "SET_DEFAULT"} for item in dependencies):
        return 6
    return 0


def calculate_risk(
    *,
    operation: str,
    direct_rows: int,
    dependencies: list[DependencyImpact],
    business_impact: BusinessImpact,
    has_where: bool,
    recoverable: bool,
) -> RiskReport:
    normalized_operation = operation.upper()
    operation_score = {
        "SELECT": 0,
        "INSERT": 8,
        "UPDATE": 10,
        "DELETE": 20,
        "TRUNCATE": 25,
        "DROP": 25,
        "ALTER": 22,
        "CREATE": 8,
    }.get(normalized_operation, 15)

    dependent_rows = sum(item.rows for item in dependencies)
    direct_score = _row_score(direct_rows)
    dependent_score = _row_score(dependent_rows)
    cascade_score = _cascade_score(dependencies)
    business_score = _business_score(business_impact)
    recoverability_score = 2 if recoverable else 5

    if normalized_operation == "DELETE" and not has_where:
        operation_score = 25
        direct_score = 20
        dependent_score = 20
        cascade_score = 15
        recoverability_score = 5

    breakdown = RiskBreakdown(
        operation=operation_score,
        direct_impact=direct_score,
        dependent_impact=dependent_score,
        cascade=cascade_score,
        business_impact=business_score,
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
    if business_impact.active_subscriptions:
        reasons.append(
            f"{business_impact.active_subscriptions:,} active subscriptions and "
            f"{business_impact.mrr_at_risk:,.2f} MRR are at risk."
        )
    if normalized_operation == "DELETE" and not has_where:
        reasons.append("The DELETE has no WHERE clause and targets the entire table.")

    return RiskReport(
        score=score,
        level=risk_level(score),
        breakdown=breakdown,
        reasons=reasons,
    )

