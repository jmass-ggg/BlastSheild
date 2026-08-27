import pytest

from app.schemas.graph import GraphEdge
from app.services.cascade_semantics import dependency_effect


def edge(on_delete: str) -> GraphEdge:
    return GraphEdge(
        id=on_delete,
        source="parent",
        target="child",
        parent_column="id",
        child_column="parent_id",
        on_delete=on_delete,
        on_update="NO ACTION",
    )


@pytest.mark.parametrize(
    ("behavior", "effect"),
    [
        ("CASCADE", "DELETE"),
        ("SET NULL", "SET_NULL"),
        ("SET DEFAULT", "SET_DEFAULT"),
        ("RESTRICT", "BLOCK"),
        ("NO ACTION", "BLOCK"),
    ],
)
def test_maps_fk_behaviors(behavior: str, effect: str) -> None:
    assert dependency_effect([edge(behavior)]) == effect


def test_stops_propagation_after_set_null() -> None:
    assert dependency_effect([edge("SET NULL"), edge("CASCADE")]) == "NONE"

