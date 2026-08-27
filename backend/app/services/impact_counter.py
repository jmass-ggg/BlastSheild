import json
from dataclasses import dataclass
from typing import Any

from sqlalchemy import Engine, text
from sqlalchemy.exc import DBAPIError

from app.core.config import get_settings
from app.core.errors import AnalysisQueryTimeoutError
from app.db.analysis_connection import analysis_transaction
from app.schemas.graph import ForeignKeyGraph
from app.schemas.impact import DependencyImpact, DirectImpact, Measurement
from app.services.cascade_semantics import dependency_effect
from app.services.query_planner import (
    build_correlated_count_query,
    build_direct_count_query,
)
from app.services.sql_parser import ParsedSQL


@dataclass(frozen=True, slots=True)
class CountMeasurement:
    rows: int
    measurement: Measurement


def _plan_document(raw_plan: Any) -> dict[str, Any]:
    if isinstance(raw_plan, str):
        raw_plan = json.loads(raw_plan)
    if isinstance(raw_plan, list):
        raw_plan = raw_plan[0]
    if not isinstance(raw_plan, dict) or "Plan" not in raw_plan:
        raise ValueError("PostgreSQL returned an unexpected EXPLAIN JSON document.")
    return raw_plan


def _estimated_result_rows(plan: dict[str, Any]) -> int:
    node = plan["Plan"]
    if node.get("Node Type") == "Aggregate" and node.get("Plans"):
        node = node["Plans"][0]
    return max(0, int(node.get("Plan Rows", 0)))


def measure_count_query(
    count_sql: str,
    engine: Engine | None = None,
    *,
    exact_cost_limit: float | None = None,
) -> CountMeasurement:
    cost_limit = (
        get_settings().exact_count_max_cost
        if exact_cost_limit is None
        else exact_cost_limit
    )
    try:
        with analysis_transaction(engine) as connection:
            raw_plan = connection.execute(
                text(f"EXPLAIN (FORMAT JSON) {count_sql}")
            ).scalar_one()
            plan = _plan_document(raw_plan)
            total_cost = float(plan["Plan"].get("Total Cost", 0))
            if total_cost <= cost_limit:
                rows = int(connection.execute(text(count_sql)).scalar_one())
                measurement: Measurement = "EXACT"
            else:
                rows = _estimated_result_rows(plan)
                measurement = "ESTIMATED"
    except DBAPIError as exc:
        sqlstate = getattr(exc.orig, "sqlstate", None)
        if sqlstate == "57014":
            raise AnalysisQueryTimeoutError() from exc
        raise

    return CountMeasurement(rows=rows, measurement=measurement)


def count_direct_impact(parsed: ParsedSQL, engine: Engine | None = None) -> DirectImpact:
    measured = measure_count_query(build_direct_count_query(parsed), engine)
    return DirectImpact(
        table=parsed.table,
        rows=measured.rows,
        measurement=measured.measurement,
    )


def count_dependency_impacts(
    parsed: ParsedSQL,
    graph: ForeignKeyGraph,
    engine: Engine | None = None,
) -> list[DependencyImpact]:
    edges_by_id = {edge.id: edge for edge in graph.edges}
    nodes_by_id = {node.id: node for node in graph.nodes}
    impacts: list[DependencyImpact] = []

    for path in graph.paths:
        path_edges = [edges_by_id[edge_id] for edge_id in path.edge_ids]
        final_edge = path_edges[-1]
        final_node = nodes_by_id[path.tables[-1]]
        measured = measure_count_query(
            build_correlated_count_query(parsed, path, graph), engine
        )
        impacts.append(
            DependencyImpact(
                table=final_node.table,
                rows=measured.rows,
                depth=path.depth,
                path=[nodes_by_id[node_id].table for node_id in path.tables],
                on_delete=final_edge.on_delete,
                effect=dependency_effect(path_edges),
                measurement=measured.measurement,
            )
        )

    return impacts
