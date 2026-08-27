from app.schemas.graph import ForeignKeyRelationship
from app.services.fk_graph import build_fk_graph


def relationship(
    parent: str,
    child: str,
    *,
    constraint: str | None = None,
    on_delete: str = "CASCADE",
) -> ForeignKeyRelationship:
    return ForeignKeyRelationship(
        constraint_name=constraint or f"{child}_{parent}_fk",
        parent_schema="public",
        parent_table=parent,
        parent_column="id",
        child_schema="public",
        child_table=child,
        child_column=f"{parent.rstrip('s')}_id",
        on_delete=on_delete,
        on_update="NO ACTION",
    )


def test_recurses_through_dependencies() -> None:
    graph = build_fk_graph(
        "public",
        "users",
        [
            relationship("users", "orders"),
            relationship("orders", "payments"),
            relationship("users", "sessions"),
        ],
    )

    assert [node.id for node in graph.nodes] == [
        "users",
        "orders",
        "sessions",
        "payments",
    ]
    payment_path = next(path for path in graph.paths if path.tables[-1] == "payments")
    assert payment_path.tables == ["users", "orders", "payments"]
    assert payment_path.depth == 2


def test_protects_against_cycles() -> None:
    graph = build_fk_graph(
        "public",
        "users",
        [
            relationship("users", "orders"),
            relationship("orders", "users", constraint="users_order_fk"),
        ],
    )

    assert [node.id for node in graph.nodes] == ["users", "orders"]
    assert len(graph.edges) == 1
    assert len(graph.paths) == 1


def test_stops_at_maximum_depth() -> None:
    graph = build_fk_graph(
        "public",
        "a",
        [
            relationship("a", "b"),
            relationship("b", "c"),
            relationship("c", "d"),
            relationship("d", "e"),
        ],
        max_depth=3,
    )

    assert {node.id for node in graph.nodes} == {"a", "b", "c", "d"}
    assert max(node.depth for node in graph.nodes) == 3


def test_preserves_fk_delete_behavior() -> None:
    graph = build_fk_graph(
        "public",
        "users",
        [relationship("users", "orders", on_delete="RESTRICT")],
    )

    assert graph.edges[0].on_delete == "RESTRICT"

