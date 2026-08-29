import pytest
from app.core.errors import MultipleStatementsError, UnsupportedSQLError
from app.services.sql_parser import parse_sql


def test_parses_delete_with_predicate() -> None:
    parsed = parse_sql(
        "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';"
    )

    assert parsed.operation == "DELETE"
    assert parsed.schema_name == "public"
    assert parsed.table == "users"
    assert parsed.has_where is True
    assert "last_login" in parsed.normalized_sql


def test_parses_schema_qualified_delete_without_where() -> None:
    parsed = parse_sql("DELETE FROM audit.events")

    assert parsed.schema_name == "audit"
    assert parsed.table == "events"
    assert parsed.has_where is False


def test_rejects_multiple_statements() -> None:
    with pytest.raises(MultipleStatementsError) as error:
        parse_sql("DELETE FROM users; DROP TABLE payments;")

    assert error.value.code == "MULTIPLE_STATEMENTS"


@pytest.mark.parametrize(
    ("sql", "operation"),
    [
        ("INSERT INTO users (email) VALUES ('a@example.test')", "INSERT"),
        ("UPDATE users SET deleted_at = NOW()", "UPDATE"),
        ("TRUNCATE TABLE users", "TRUNCATE"),
        ("DROP TABLE users", "DROP"),
        ("ALTER TABLE users ADD COLUMN note TEXT", "ALTER"),
        ("CREATE TABLE notes (id BIGINT)", "CREATE"),
    ],
)
def test_detects_but_rejects_non_delete_operations(
    sql: str, operation: str
) -> None:
    with pytest.raises(UnsupportedSQLError) as error:
        parse_sql(sql)

    assert error.value.code == "UNSUPPORTED_SQL"
    assert operation in error.value.message
