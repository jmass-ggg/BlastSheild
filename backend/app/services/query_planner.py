from sqlglot import exp

from app.core.errors import UnsupportedSQLError
from app.schemas.graph import DependencyPath, ForeignKeyGraph, GraphNode
from app.services.sql_parser import ParsedSQL


def build_direct_count_query(parsed: ParsedSQL) -> str:
    if parsed.operation != "DELETE":
        raise UnsupportedSQLError("Direct impact counting currently supports DELETE only.")

    count_query = exp.select(exp.func("COUNT", exp.Star())).from_(parsed.target.copy())
    where_expression = parsed.expression.args.get("where")
    if isinstance(where_expression, exp.Where):
        count_query = count_query.where(where_expression.this.copy())

    return count_query.sql(dialect="postgres", pretty=False)


def _table_expression(node: GraphNode, alias: str) -> exp.Table:
    table = exp.Table(
        this=exp.to_identifier(node.table),
        db=exp.to_identifier(node.schema_name),
    )
    return table.as_(alias)


def _qualified_root_predicate(parsed: ParsedSQL, root_alias: str) -> exp.Expression | None:
    where_expression = parsed.expression.args.get("where")
    if not isinstance(where_expression, exp.Where):
        return None

    predicate = where_expression.this.copy()
    known_root_names = {parsed.table}
    if parsed.target.alias:
        known_root_names.add(parsed.target.alias)

    for column in predicate.find_all(exp.Column):
        if not column.table or column.table in known_root_names:
            column.set("table", exp.to_identifier(root_alias))
    return predicate


def _path_query(
    parsed: ParsedSQL,
    path: DependencyPath,
    graph: ForeignKeyGraph,
    projections: list[exp.Expression],
) -> exp.Select:
    nodes_by_id = {node.id: node for node in graph.nodes}
    edges_by_id = {edge.id: edge for edge in graph.edges}
    final_index = len(path.tables) - 1
    query = exp.select(*projections).from_(
        _table_expression(nodes_by_id[path.tables[-1]], f"t{final_index}")
    )

    for child_index in range(final_index, 0, -1):
        edge = edges_by_id[path.edge_ids[child_index - 1]]
        parent_node = nodes_by_id[path.tables[child_index - 1]]
        join_condition = exp.column(
            edge.child_column, table=f"t{child_index}"
        ).eq(exp.column(edge.parent_column, table=f"t{child_index - 1}"))
        query = query.join(
            _table_expression(parent_node, f"t{child_index - 1}"),
            on=join_condition,
        )

    predicate = _qualified_root_predicate(parsed, "t0")
    if predicate is not None:
        query = query.where(predicate)
    return query


def build_correlated_count_query(
    parsed: ParsedSQL,
    path: DependencyPath,
    graph: ForeignKeyGraph,
) -> str:
    query = _path_query(parsed, path, graph, [exp.func("COUNT", exp.Star())])
    return query.sql(dialect="postgres", pretty=False)
