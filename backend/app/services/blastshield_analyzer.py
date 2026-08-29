import logging
import uuid
from time import perf_counter

from sqlalchemy import Engine

from app.core.config import Settings, get_settings
from app.core.errors import BlastShieldError
from app.core.logging import log_lifecycle
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import (
    ActionReport,
    AnalysisResponse,
    AnalyzeRequest,
    TimelineItem,
)
from app.schemas.graph import ReportGraph, ReportGraphEdge, ReportGraphNode
from app.schemas.impact import ImpactSummary
from app.services.analysis_pipeline import AnalysisPipeline
from app.services.risk_engine import calculate_risk
from app.services.safer_alternative import generate_safer_alternative
from app.services.sql_parser import parse_sql

logger = logging.getLogger(__name__)


class BlastShieldAnalyzer:
    def __init__(
        self,
        *,
        analysis_engine: Engine | None = None,
        repository: AnalysisRepository | None = None,
        settings: Settings | None = None,
        pipeline: AnalysisPipeline | None = None,
    ) -> None:
        self._repository = repository or AnalysisRepository()
        selected_settings = settings or get_settings()
        self._pipeline = pipeline or AnalysisPipeline(
            analysis_engine=analysis_engine,
            settings=selected_settings,
        )

    def analyze(self, request: AnalyzeRequest) -> AnalysisResponse:
        started = perf_counter()
        parsed = parse_sql(request.sql)
        analysis_id = uuid.uuid4()
        self._repository.create_analyzing(
            analysis_id=analysis_id,
            original_sql=request.sql,
            normalized_sql=parsed.normalized_sql,
            operation=parsed.operation,
            target_schema=parsed.schema_name,
            target_table=parsed.table,
            source=request.source,
            reason=request.reason,
        )
        log_lifecycle(
            logger,
            analysis_id=analysis_id,
            event="analysis_started",
            status_after="ANALYZING",
        )

        try:
            snapshot = self._pipeline.measure(parsed)
            graph = snapshot.graph
            direct = snapshot.direct
            dependencies = snapshot.dependencies
            business = snapshot.business_impact
            safer = generate_safer_alternative(
                parsed,
                snapshot.target_metadata,
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
                sql=request.sql,
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
            self._repository.complete(
                analysis_id,
                report=response.model_dump(mode="json"),
                risk_score=risk.score,
                risk_level=risk.level,
                fingerprint=snapshot.fingerprint,
            )
            measurement_modes = {direct.measurement} | {
                item.measurement for item in dependencies
            }
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="analysis_completed",
                status_before="ANALYZING",
                status_after="PENDING_APPROVAL",
                duration_ms=(perf_counter() - started) * 1_000,
                measurement_mode="/".join(sorted(measurement_modes)),
            )
            return response
        except Exception as exc:
            self._repository.mark_failed(analysis_id)
            log_lifecycle(
                logger,
                analysis_id=analysis_id,
                event="analysis_failed",
                status_before="ANALYZING",
                status_after="FAILED",
                duration_ms=(perf_counter() - started) * 1_000,
                error_code=(
                    exc.code if isinstance(exc, BlastShieldError) else "INTERNAL_ERROR"
                ),
            )
            raise
