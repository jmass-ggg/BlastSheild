import uuid
from collections.abc import Callable
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.db.app_database import get_session_factory
from app.db.models import AnalysisRecord


class AnalysisRepository:
    def __init__(
        self,
        session_factory: Callable[[], Session] | None = None,
    ) -> None:
        self._session_factory = session_factory or get_session_factory()

    def create_analyzing(
        self,
        *,
        analysis_id: uuid.UUID,
        original_sql: str,
        normalized_sql: str,
        operation: str,
        target_table: str,
        source: str,
        reason: str | None,
    ) -> AnalysisRecord:
        record = AnalysisRecord(
            id=analysis_id,
            original_sql=original_sql,
            normalized_sql=normalized_sql,
            operation=operation,
            target_table=target_table,
            source=source,
            reason=reason,
            status="ANALYZING",
            report={},
        )
        with self._session_factory() as session:
            session.add(record)
            session.commit()
            session.refresh(record)
        return record

    def complete(
        self,
        analysis_id: uuid.UUID,
        *,
        report: dict[str, Any],
        risk_score: int,
        risk_level: str,
        fingerprint: str,
    ) -> AnalysisRecord:
        with self._session_factory() as session:
            record = session.get(AnalysisRecord, analysis_id)
            if record is None:
                raise NotFoundError()
            record.status = "PENDING_APPROVAL"
            record.report = report
            record.risk_score = risk_score
            record.risk_level = risk_level
            record.fingerprint = fingerprint
            session.commit()
            session.refresh(record)
            return record

    def mark_failed(self, analysis_id: uuid.UUID) -> None:
        with self._session_factory() as session:
            record = session.get(AnalysisRecord, analysis_id)
            if record is None:
                return
            record.status = "FAILED"
            session.commit()

    def get(self, analysis_id: uuid.UUID) -> AnalysisRecord:
        with self._session_factory() as session:
            record = session.get(AnalysisRecord, analysis_id)
            if record is None:
                raise NotFoundError()
            session.expunge(record)
            return record

    def list_completed(self, *, limit: int = 100) -> list[AnalysisRecord]:
        with self._session_factory() as session:
            records = list(
                session.scalars(
                    select(AnalysisRecord)
                    .where(AnalysisRecord.report != {})
                    .order_by(AnalysisRecord.created_at.desc())
                    .limit(limit)
                )
            )
            for record in records:
                session.expunge(record)
            return records
