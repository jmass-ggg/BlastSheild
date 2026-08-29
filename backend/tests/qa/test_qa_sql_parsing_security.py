import pytest
from app.core.errors import (
    InvalidSQLError,
    MultipleStatementsError,
    UnsupportedSQLError,
)
from app.services.sql_parser import parse_sql


def test_sql_parser_valid_variants():
    """Verify sql_parser handles valid syntax variations cleanly."""
    valid_sqls = [
        ("DELETE FROM users WHERE id = 1", "public", "users", True),
        ("DELETE FROM public.users WHERE id = 1", "public", "users", True),
        ('DELETE FROM "users" WHERE "id" = 1', "public", "users", True),
        ('DELETE FROM "public"."users" WHERE "id" = 1', "public", "users", True),
        ("delete from users where id = 1", "public", "users", True),
        ("DELETE FROM users", "public", "users", False),
        ("DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years'", "public", "users", True),
        ("DELETE FROM users WHERE (id > 10 AND id < 20) OR email LIKE '%@test.com'", "public", "users", True),
        ("DELETE FROM users WHERE id IN (1, 2, 3, 4, 5)", "public", "users", True),
        ("DELETE FROM users WHERE id BETWEEN 10 AND 50", "public", "users", True),
        ("DELETE FROM users WHERE deleted_at IS NOT NULL", "public", "users", True),
        ("DELETE /* inline comment */ FROM users WHERE id = 1", "public", "users", True),
        ("DELETE FROM users -- line comment\n WHERE id = 1", "public", "users", True),
    ]

    for query, expected_schema, expected_table, expected_has_where in valid_sqls:
        parsed = parse_sql(query)
        assert parsed.operation == "DELETE"
        assert parsed.schema_name == expected_schema
        assert parsed.table == expected_table
        assert parsed.has_where == expected_has_where
        assert parsed.normalized_sql is not None


def test_sql_parser_injection_attempts():
    """Verify injection vectors fail closed or parse safely without multi-statements."""
    # 1. SQL Injection with semicolon + second statement -> MultipleStatementsError
    multi_statements = [
        "DELETE FROM users WHERE id = 1; DROP TABLE users;",
        "DELETE FROM users WHERE id = 1; SELECT * FROM users;",
        "DELETE FROM users; TRUNCATE TABLE orders;",
        "DELETE FROM users WHERE email = 'a@b.com'; UPDATE users SET full_name = 'hacked';",
    ]
    for injection in multi_statements:
        with pytest.raises(MultipleStatementsError):
            parse_sql(injection)

    # 2. SQL with tautology in WHERE (e.g. '1'='1') is a single valid statement that gets analyzed
    tautology = "DELETE FROM users WHERE email = 'x' OR '1'='1'"
    parsed = parse_sql(tautology)
    assert parsed.operation == "DELETE"
    assert parsed.has_where is True


def test_sql_parser_rejects_unsupported_clauses():
    """Verify clauses outside MVP scope are cleanly rejected with UnsupportedSQLError."""
    clauses = [
        "DELETE FROM users USING orders WHERE users.id = orders.user_id",
        "DELETE FROM users WHERE id = 1 RETURNING id, email",
        "WITH stale AS (SELECT id FROM users) DELETE FROM users WHERE id IN (SELECT id FROM stale)",
    ]
    for query in clauses:
        with pytest.raises(UnsupportedSQLError):
            parse_sql(query)


def test_sql_parser_rejects_non_delete_dml_and_ddl():
    """Verify non-DELETE DML / DDL are rejected."""
    statements = [
        "SELECT * FROM users",
        "INSERT INTO users (email) VALUES ('test@example.com')",
        "UPDATE users SET full_name = 'foo'",
        "DROP TABLE users CASCADE",
        "TRUNCATE TABLE users",
        "ALTER TABLE users DROP COLUMN email",
        "CREATE INDEX idx_test ON users(email)",
        "GRANT ALL PRIVILEGES ON TABLE users TO public",
        "REVOKE ALL ON TABLE users FROM public",
        "VACUUM FULL users",
        "EXPLAIN ANALYZE SELECT * FROM users",
    ]
    for stmt in statements:
        with pytest.raises(UnsupportedSQLError) as exc_info:
            parse_sql(stmt)
        assert "only DELETE is fully supported" in exc_info.value.message or "detected" in exc_info.value.message


def test_sql_parser_syntax_errors():
    """Verify malformed SQL triggers InvalidSQLError."""
    malformed = [
        "",
        "   ",
        "NOT A SQL STATEMENT",
        "DELETE",
        "DELETE FROM",
        "DELETE WHERE id = 1",
        "DELETE FROM users WHERE (id = 1",  # unclosed paren
        "DELETE FROM users WHERE id = 'unclosed string",
        "DELETE FROM ,,,",
    ]
    for bad in malformed:
        with pytest.raises(InvalidSQLError):
            parse_sql(bad)
