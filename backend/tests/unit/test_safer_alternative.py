from app.schemas.graph import ColumnMetadata, TableMetadata
from app.services.safer_alternative import generate_safer_alternative
from app.services.sql_parser import parse_sql


def table_with(*columns: str) -> TableMetadata:
    return TableMetadata(
        schema_name="public",
        name="users",
        columns=[
            ColumnMetadata(name=name, data_type="boolean", nullable=True)
            for name in columns
        ],
    )


def test_uses_deleted_at_when_discovered() -> None:
    alternative = generate_safer_alternative(
        parse_sql("DELETE FROM users WHERE id < 20"),
        table_with("id", "deleted_at"),
        direct_rows=19,
    )

    assert alternative.available is True
    assert alternative.sql == "UPDATE users SET deleted_at = NOW() WHERE id < 20"
    assert alternative.risk_score is not None


def test_uses_is_deleted_when_discovered() -> None:
    alternative = generate_safer_alternative(
        parse_sql("DELETE FROM users WHERE id = 1"),
        table_with("id", "is_deleted"),
        direct_rows=1,
    )

    assert alternative.sql == "UPDATE users SET is_deleted = TRUE WHERE id = 1"


def test_does_not_invent_an_alternative() -> None:
    alternative = generate_safer_alternative(
        parse_sql("DELETE FROM users WHERE id = 1"),
        table_with("id"),
        direct_rows=1,
    )

    assert alternative.available is False
    assert alternative.sql is None

