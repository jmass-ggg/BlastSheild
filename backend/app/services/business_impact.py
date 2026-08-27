from decimal import Decimal

from sqlalchemy import Engine, text
from sqlalchemy.exc import DBAPIError

from app.core.config import Settings, get_settings
from app.core.errors import AnalysisQueryTimeoutError
from app.db.analysis_connection import analysis_transaction
from app.schemas.graph import DependencyPath, ForeignKeyGraph
from app.schemas.impact import BusinessImpact
from app.services.query_planner import build_business_impact_query
from app.services.sql_parser import ParsedSQL


def calculate_business_impact(
    parsed: ParsedSQL,
    graph: ForeignKeyGraph,
    engine: Engine | None = None,
    *,
    settings: Settings | None = None,
) -> BusinessImpact:
    selected_settings = settings or get_settings()
    nodes_by_id = {node.id: node for node in graph.nodes}
    matching_paths = [
        path
        for path in graph.paths
        if nodes_by_id[path.tables[-1]].table
        == selected_settings.business_subscription_table
    ]

    root_node = next(node for node in graph.nodes if node.depth == 0)
    if parsed.table == selected_settings.business_subscription_table:
        matching_paths.insert(
            0,
            DependencyPath(tables=[root_node.id], depth=0, edge_ids=[]),
        )
    if not matching_paths:
        return BusinessImpact()

    path = min(matching_paths, key=lambda item: item.depth)
    query = build_business_impact_query(
        parsed,
        path,
        graph,
        status_column=selected_settings.business_subscription_status_column,
        active_value=selected_settings.business_subscription_active_value,
        price_column=selected_settings.business_subscription_price_column,
    )
    try:
        with analysis_transaction(engine) as connection:
            row = connection.execute(text(query)).mappings().one()
    except DBAPIError as exc:
        if getattr(exc.orig, "sqlstate", None) == "57014":
            raise AnalysisQueryTimeoutError() from exc
        raise

    mrr = Decimal(row["mrr_at_risk"] or 0)
    return BusinessImpact(
        active_subscriptions=int(row["active_subscriptions"]),
        mrr_at_risk=float(mrr),
        arr_at_risk=float(mrr * 12),
    )
