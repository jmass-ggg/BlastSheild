from dataclasses import dataclass

from sqlalchemy import Engine

from app.core.config import Settings, get_settings
from app.core.errors import InvalidSQLError
from app.schemas.graph import ForeignKeyGraph, TableMetadata
from app.schemas.impact import DependencyImpact, DirectImpact
from app.services.fingerprint import analysis_fingerprint
from app.services.fk_graph import build_fk_graph
from app.services.impact_counter import count_dependency_impacts, count_direct_impact
from app.services.schema_analyzer import discover_schema
from app.services.sql_parser import ParsedSQL


@dataclass(frozen=True, slots=True)
class AnalysisSnapshot:
    target_metadata: TableMetadata
    graph: ForeignKeyGraph
    direct: DirectImpact
    dependencies: list[DependencyImpact]
    fingerprint: str


class AnalysisPipeline:
    def __init__(
        self,
        *,
        analysis_engine: Engine | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._analysis_engine = analysis_engine
        self._settings = settings or get_settings()

    def measure(self, parsed: ParsedSQL) -> AnalysisSnapshot:
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
        dependencies = count_dependency_impacts(parsed, graph, self._analysis_engine)
        fingerprint = analysis_fingerprint(
            {
                "normalized_sql": parsed.normalized_sql,
                "graph": graph.model_dump(mode="json"),
                "direct": direct.model_dump(mode="json"),
                "dependencies": [
                    item.model_dump(mode="json") for item in dependencies
                ],
            }
        )
        return AnalysisSnapshot(
            target_metadata=target_metadata,
            graph=graph,
            direct=direct,
            dependencies=dependencies,
            fingerprint=fingerprint,
        )
