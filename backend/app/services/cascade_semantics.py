from app.schemas.graph import GraphEdge
from app.schemas.impact import DependencyEffect


def dependency_effect(path_edges: list[GraphEdge]) -> DependencyEffect:
    """Return the actual effect reaching the final table in an FK path."""
    for index, edge in enumerate(path_edges):
        behavior = edge.on_delete.upper()
        if behavior in {"RESTRICT", "NO ACTION"}:
            return "BLOCK"
        if behavior == "SET NULL":
            return "SET_NULL" if index == len(path_edges) - 1 else "NONE"
        if behavior == "SET DEFAULT":
            return "SET_DEFAULT" if index == len(path_edges) - 1 else "NONE"
    return "DELETE"
