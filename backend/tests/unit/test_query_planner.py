from sqlglot import parse_one

from app.services.query_planner import build_direct_count_query
from app.services.sql_parser import parse_sql


def test_builds_count_without_ever_reusing_delete_node() -> None:
    parsed = parse_sql("DELETE FROM users WHERE id < 20")
    count_sql = build_direct_count_query(parsed)
    generated = parse_one(count_sql, read="postgres")

    assert generated.key == "select"
    assert count_sql == "SELECT COUNT(*) FROM users WHERE id < 20"
    assert "DELETE" not in count_sql.upper()


def test_unbounded_delete_becomes_unbounded_count() -> None:
    parsed = parse_sql("DELETE FROM users")

    assert build_direct_count_query(parsed) == "SELECT COUNT(*) FROM users"

