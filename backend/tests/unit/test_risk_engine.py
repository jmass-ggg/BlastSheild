import pytest

from app.schemas.impact import BusinessImpact
from app.services.risk_engine import calculate_risk, risk_level


@pytest.mark.parametrize(
    ("score", "level"),
    [
        (0, "LOW"),
        (24, "LOW"),
        (25, "MEDIUM"),
        (49, "MEDIUM"),
        (50, "HIGH"),
        (74, "HIGH"),
        (75, "CRITICAL"),
        (100, "CRITICAL"),
    ],
)
def test_risk_buckets(score: int, level: str) -> None:
    assert risk_level(score) == level


def test_delete_without_where_is_near_maximum_and_critical() -> None:
    report = calculate_risk(
        operation="DELETE",
        direct_rows=1,
        dependencies=[],
        business_impact=BusinessImpact(),
        has_where=False,
        recoverable=True,
    )

    assert report.score >= 85
    assert report.level == "CRITICAL"
    assert report.breakdown.operation == 25
    assert report.breakdown.direct_impact == 20


def test_identical_inputs_produce_identical_risk() -> None:
    arguments = dict(
        operation="DELETE",
        direct_rows=40,
        dependencies=[],
        business_impact=BusinessImpact(active_subscriptions=2, mrr_at_risk=50),
        has_where=True,
        recoverable=True,
    )
    assert calculate_risk(**arguments) == calculate_risk(**arguments)

