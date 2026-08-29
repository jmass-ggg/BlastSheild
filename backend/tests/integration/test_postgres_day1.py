import os

import pytest
from app.services.fk_graph import build_fk_graph
from app.services.impact_counter import count_direct_impact
from app.services.schema_analyzer import discover_schema
from app.services.sql_parser import parse_sql
from sqlalchemy import create_engine, text
from sqlalchemy.exc import DBAPIError

TEST_DATABASE_URL = os.getenv("BLASTSHIELD_TEST_DATABASE_URL")
pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not TEST_DATABASE_URL,
        reason="BLASTSHIELD_TEST_DATABASE_URL is not configured",
    ),
]


@pytest.fixture(scope="module")
def analyzer_engine():
    engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    try:
        yield engine
    finally:
        engine.dispose()


def test_analyzer_can_select(analyzer_engine) -> None:
    with analyzer_engine.connect() as connection:
        assert connection.execute(text("SELECT COUNT(*) FROM users")).scalar_one() == 100


def test_database_rejects_analyzer_delete(analyzer_engine) -> None:
    with pytest.raises(DBAPIError), analyzer_engine.begin() as connection:
        connection.execute(text("DELETE FROM users WHERE id = -1"))


def test_direct_impact_uses_live_data(analyzer_engine) -> None:
    parsed = parse_sql(
        "DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years'"
    )

    impact = count_direct_impact(parsed, analyzer_engine)

    assert impact.rows == 40
    assert impact.measurement == "EXACT"


def test_fk_graph_is_discovered_from_postgres(analyzer_engine) -> None:
    metadata = discover_schema("public", analyzer_engine)
    graph = build_fk_graph("public", "users", metadata.foreign_keys)

    assert {table.name for table in metadata.tables} == {
        "users",
        "orders",
        "payments",
        "subscriptions",
        "sessions",
    }
    assert {edge.target for edge in graph.edges} == {
        "orders",
        "payments",
        "subscriptions",
        "sessions",
    }
    assert all(edge.on_delete == "CASCADE" for edge in graph.edges)
    assert next(node for node in graph.nodes if node.id == "payments").depth == 2

