import uuid

from sqlalchemy import Engine

from app.core.config import Settings, get_settings
from app.core.errors import InvalidSQLError
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import (
    ActionReport,
    AnalysisResponse,
    AnalyzeRequest,
    TimelineItem,
)
from app.schemas.graph import ReportGraph, ReportGraphEdge, ReportGraphNode
from app.schemas.impact import ImpactSummary
from app.services.business_impact import calculate_business_impact
from app.services.fingerprint import analysis_fingerprint
from app.services.fk_graph import build_fk_graph
from app.services.impact_counter import count_dependency_impacts, count_direct_impact
from app.services.risk_engine import calculate_risk
from app.services.safer_alternative import generate_safer_alternative
from app.services.schema_analyzer import discover_schema
from app.services.sql_parser import parse_sql


class BlastShieldAnalyzer:
    def __init__(
        self,
        *,
        analysis_engine: Engine | None = None,
        repository: AnalysisRepository | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._analysis_engine = analysis_engine
        self._repository = repository or AnalysisRepository()
        self._settings = settings or get_settings()

    def analyze(self, request: AnalyzeRequest) -> AnalysisResponse:
        parsed = parse_sql(request.sql)
        analysis_id = uuid.uuid4()
        self._repository.create_analyzing(
            analysis_id=analysis_id,
            original_sql=request.sql,
            normalized_sql=parsed.normalized_sql,
            operation=parsed.operation,
            target_table=parsed.table,
            source=request.source,
            reason=request.reason,
        )

        try:
            metadata = discover_schema(parsed.schema_name, self._analysis_engine)
            target_metadata = next(
                (
                    table
                    for table in metadata.tables
                    if table.schema_name == parsed.schema_name and table.name == parsed.table
                ),
                None,
            )
            if target_metadata is None:
                raise InvalidSQLError(
                    f"Target table {parsed.schema_name}.{parsed.table} does not exist."
                )

            graph = build_fk_graph(
                parsed.schema_name,
                parsed.table,
                metadata.foreign_keys,
                max_depth=self._settings.fk_max_depth,
            )
            direct = count_direct_impact(parsed, self._analysis_engine)
            dependencies = count_dependency_impacts(
                parsed, graph, self._analysis_engine
            )
            business = calculate_business_impact(
                parsed,
                graph,
                self._analysis_engine,
                settings=self._settings,
            )
            safer = generate_safer_alternative(
                parsed,
                target_metadata,
                direct_rows=direct.rows,
            )
            risk = calculate_risk(
                operation=parsed.operation,
                direct_rows=direct.rows,
                dependencies=dependencies,
                business_impact=business,
                has_where=parsed.has_where,
                recoverable=safer.available,
            )

            dependent_rows = sum(item.rows for item in dependencies)
            rows_by_node: dict[str, int] = {graph.nodes[0].id: direct.rows}
            for path, dependency in zip(graph.paths, dependencies, strict=True):
                rows_by_node[path.tables[-1]] = (
                    rows_by_node.get(path.tables[-1], 0) + dependency.rows
                )
            report_graph = ReportGraph(
                nodes=[
                    ReportGraphNode(
                        id=node.id,
                        table=node.table,
                        rows=rows_by_node.get(node.id, 0),
                        depth=node.depth,
                    )
                    for node in graph.nodes
                ],
                edges=[
                    ReportGraphEdge(
                        id=f"{edge.source}-{edge.target}",
                        source=edge.source,
                        target=edge.target,
                        on_delete=edge.on_delete,
                    )
                    for edge in graph.edges
                ],
            )
            response = AnalysisResponse(
                analysis_id=analysis_id,
                status="PENDING_APPROVAL",
                action=ActionReport(
                    operation=parsed.operation,
                    table=parsed.table,
                    has_where=parsed.has_where,
                ),
                impact=ImpactSummary(
                    direct_rows=direct.rows,
                    dependent_rows=dependent_rows,
                    total_rows=direct.rows + dependent_rows,
                ),
                dependencies=dependencies,
                business_impact=business,
                risk=risk,
                graph=report_graph,
                safer_alternative=safer,
                requires_approval=True,
                timeline=[
                    TimelineItem(
                        key="intercepted", label="SQL intercepted", status="complete"
                    ),
                    TimelineItem(
                        key="parsed", label="SQL parsed", status="complete"
                    ),
                    TimelineItem(
                        key="measured", label="Impact measured", status="complete"
                    ),
                    TimelineItem(
                        key="approval",
                        label="Waiting for human approval",
                        status="current",
                    ),
                ],
            )
            fingerprint = analysis_fingerprint(
                {
                    "normalized_sql": parsed.normalized_sql,
                    "graph": graph.model_dump(mode="json"),
                    "direct": direct.model_dump(mode="json"),
                    "dependencies": [
                        item.model_dump(mode="json") for item in dependencies
                    ],
                    "business_impact": business.model_dump(mode="json"),
                }
            )
            self._repository.complete(
                analysis_id,
                report=response.model_dump(mode="json"),
                risk_score=risk.score,
                risk_level=risk.level,
                fingerprint=fingerprint,
            )
            return response
        except Exception:
            self._repository.mark_failed(analysis_id)
            raise

