from collections import defaultdict

from app.schemas.graph import (
    DependencyPath,
    ForeignKeyGraph,
    ForeignKeyRelationship,
    GraphEdge,
    GraphNode,
)


def _table_id(schema_name: str, table: str) -> str:
    return table if schema_name == "public" else f"{schema_name}.{table}"


def build_fk_graph(
    root_schema: str,
    root_table: str,
    relationships: list[ForeignKeyRelationship],
    *,
    max_depth: int = 3,
) -> ForeignKeyGraph:
    outgoing: dict[tuple[str, str], list[ForeignKeyRelationship]] = defaultdict(list)
    for relationship in relationships:
        outgoing[(relationship.parent_schema, relationship.parent_table)].append(relationship)

    for edges in outgoing.values():
        edges.sort(key=lambda edge: (edge.child_schema, edge.child_table, edge.constraint_name))

    root_id = _table_id(root_schema, root_table)
    nodes_by_id: dict[str, GraphNode] = {
        root_id: GraphNode(
            id=root_id,
            table=root_table,
            schema_name=root_schema,
            depth=0,
        )
    }
    graph_edges: dict[str, GraphEdge] = {}
    paths: list[DependencyPath] = []

    def walk(
        schema_name: str,
        table: str,
        depth: int,
        table_path: list[str],
        edge_path: list[str],
        visited: set[tuple[str, str]],
    ) -> None:
        if depth >= max_depth:
            return

        for relationship in outgoing.get((schema_name, table), []):
            child_key = (relationship.child_schema, relationship.child_table)
            if child_key in visited:
                continue

            source_id = _table_id(relationship.parent_schema, relationship.parent_table)
            child_id = _table_id(relationship.child_schema, relationship.child_table)
            next_depth = depth + 1
            edge_id = relationship.constraint_name

            existing_node = nodes_by_id.get(child_id)
            if existing_node is None or next_depth < existing_node.depth:
                nodes_by_id[child_id] = GraphNode(
                    id=child_id,
                    table=relationship.child_table,
                    schema_name=relationship.child_schema,
                    depth=next_depth,
                )

            graph_edges.setdefault(
                edge_id,
                GraphEdge(
                    id=edge_id,
                    source=source_id,
                    target=child_id,
                    parent_column=relationship.parent_column,
                    child_column=relationship.child_column,
                    on_delete=relationship.on_delete,
                    on_update=relationship.on_update,
                ),
            )

            next_table_path = [*table_path, child_id]
            next_edge_path = [*edge_path, edge_id]
            paths.append(
                DependencyPath(
                    tables=next_table_path,
                    depth=next_depth,
                    edge_ids=next_edge_path,
                )
            )
            walk(
                relationship.child_schema,
                relationship.child_table,
                next_depth,
                next_table_path,
                next_edge_path,
                {*visited, child_key},
            )

    walk(root_schema, root_table, 0, [root_id], [], {(root_schema, root_table)})

    return ForeignKeyGraph(
        nodes=sorted(nodes_by_id.values(), key=lambda node: (node.depth, node.id)),
        edges=sorted(graph_edges.values(), key=lambda edge: edge.id),
        paths=sorted(paths, key=lambda path: (path.depth, path.tables)),
    )

