from sqlglot import parse_one

from app.schemas.graph import ForeignKeyRelationship
from app.services.fk_graph import build_fk_graph
from app.services.query_planner import build_correlated_count_query
from app.services.sql_parser import parse_sql


def test_builds_depth_two_correlated_count_and_qualifies_root_predicate() -> None:
    parsed = parse_sql("DELETE FROM users WHERE id < 20")
    graph = build_fk_graph(
        "public",
        "users",
        [
            ForeignKeyRelationship(
                constraint_name="orders_user_id_fkey",
                parent_schema="public",
                parent_table="users",
                parent_column="id",
                child_schema="public",
                child_table="orders",
                child_column="user_id",
                on_delete="CASCADE",
                on_update="NO ACTION",
            ),
            ForeignKeyRelationship(
                constraint_name="payments_order_id_fkey",
                parent_schema="public",
                parent_table="orders",
                parent_column="id",
                child_schema="public",
                child_table="payments",
                child_column="order_id",
                on_delete="CASCADE",
                on_update="NO ACTION",
            ),
        ],
    )
    payment_path = next(path for path in graph.paths if path.tables[-1] == "payments")

    query = build_correlated_count_query(parsed, payment_path, graph)

    assert parse_one(query, read="postgres").key == "select"
    assert "DELETE" not in query.upper()
    assert "public.payments AS t2" in query
    assert "t2.order_id = t1.id" in query
    assert "t1.user_id = t0.id" in query
    assert "WHERE t0.id < 20" in query

