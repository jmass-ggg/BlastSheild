import hmac

from app.db.models import AnalysisRecord
from app.services.analysis_pipeline import AnalysisPipeline
from app.services.sql_parser import parse_sql


class Revalidator:
    def __init__(self, pipeline: AnalysisPipeline | None = None) -> None:
        self._pipeline = pipeline or AnalysisPipeline()

    def revalidate(self, record: AnalysisRecord) -> bool:
        parsed = parse_sql(record.normalized_sql)
        if (
            parsed.operation != record.operation
            or parsed.schema_name != record.target_schema
            or parsed.table != record.target_table
        ):
            raise ValueError("Stored analysis metadata does not match its normalized SQL.")
        snapshot = self._pipeline.measure(parsed)
        expected = record.fingerprint or ""
        return bool(expected) and hmac.compare_digest(
            expected, snapshot.fingerprint
        )
