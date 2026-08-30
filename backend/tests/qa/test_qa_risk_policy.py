from app.schemas.graph import ColumnMetadata, TableMetadata
from app.schemas.impact import DependencyImpact
from app.services.risk_engine import calculate_risk, risk_level
from app.services.safer_alternative import generate_safer_alternative
from app.services.sql_parser import parse_sql


def test_risk_level_boundaries():
    """Verify deterministic risk level boundaries."""
    assert risk_level(0) == "LOW"
    assert risk_level(24) == "LOW"
    assert risk_level(25) == "MEDIUM"
    assert risk_level(49) == "MEDIUM"
    assert risk_level(50) == "HIGH"
    assert risk_level(74) == "HIGH"
    assert risk_level(75) == "CRITICAL"
    assert risk_level(100) == "CRITICAL"


def test_generic_risk_calculation_components():
    """Verify risk breakdown components and capping at 100."""
    dependencies = [
        DependencyImpact(
            table="orders",
            rows=50,
            depth=1,
            path=["users", "orders"],
            on_delete="CASCADE",
            effect="DELETE",
            measurement="EXACT",
        )
    ]

    report = calculate_risk(
        operation="DELETE",
        direct_rows=25,
        dependencies=dependencies,
        has_where=True,
        recoverable=True,
    )

    assert report.breakdown.operation == 20
    assert report.breakdown.direct_impact == 8
    assert report.breakdown.dependent_impact == 8
    assert report.breakdown.cascade == 12  # depth 1 cascade
    assert report.breakdown.recoverability == 2  # recoverable

    expected_score = 20 + 8 + 8 + 12 + 2
    assert report.score == expected_score
    assert report.level == risk_level(expected_score)


def test_risk_blocking_dependency():
    """Verify RESTRICT receives max cascade score and a blocking reason."""
    dependencies = [
        DependencyImpact(
            table="orders",
            rows=5,
            depth=1,
            path=["users", "orders"],
            on_delete="RESTRICT",
            effect="BLOCK",
            measurement="EXACT",
        )
    ]
    report = calculate_risk(
        operation="DELETE",
        direct_rows=5,
        dependencies=dependencies,
        has_where=True,
        recoverable=True,
    )
    assert report.breakdown.cascade == 25
    assert any("block the DELETE" in reason for reason in report.reasons)


def test_safer_alternative_generation():
    """Verify safer alternative generates UPDATE when deleted_at column exists."""
    parsed = parse_sql("DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years'")
    metadata_with_soft_delete = TableMetadata(
        schema_name="public",
        name="users",
        columns=[
            ColumnMetadata(name="id", data_type="bigint", nullable=False),
            ColumnMetadata(name="email", data_type="text", nullable=False),
            ColumnMetadata(name="last_login", data_type="timestamptz", nullable=False),
            ColumnMetadata(name="deleted_at", data_type="timestamptz", nullable=True),
        ],
        primary_key=["id"],
    )

    safer = generate_safer_alternative(parsed, metadata_with_soft_delete, direct_rows=40)
    assert safer.available is True
    assert safer.sql is not None
    assert "UPDATE users SET deleted_at = NOW() WHERE" in safer.sql
    assert safer.risk_score is not None
    assert safer.risk_score < 25
    assert safer.risk_level == "LOW"

    # Table without deleted_at
    metadata_without_soft_delete = TableMetadata(
        schema_name="public",
        name="logs",
        columns=[ColumnMetadata(name="id", data_type="bigint", nullable=False)],
        primary_key=["id"],
    )
    safer_none = generate_safer_alternative(parsed, metadata_without_soft_delete, direct_rows=10)
    assert safer_none.available is False
    assert safer_none.sql is None
