import uuid
from collections.abc import Callable
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.errors import (
    ApprovalRequiredError,
    ExecutionFailedError,
    InvalidStateError,
    NotFoundError,
)
from app.db.app_database import get_session_factory
from app.db.models import AnalysisRecord


class AnalysisRepository:
    def __init__(
        self,
        session_factory: Callable[[], Session] | None = None,
    ) -> None:
        self._session_factory = session_factory or get_session_factory()

    @staticmethod
    def _sync_report(
        record: AnalysisRecord,
        *,
        status: str,
        timeline_key: str,
        timeline_label: str,
        timeline_status: str,
    ) -> None:
        report = deepcopy(record.report or {})
        if not report:
            return
        report["status"] = status
        report["requires_approval"] = status == "PENDING_APPROVAL"
        timeline = list(report.get("timeline", []))
        updated = False
        for item in timeline:
            if item.get("key") == timeline_key:
                item.update(label=timeline_label, status=timeline_status)
                updated = True
                break
        if not updated:
            timeline.append(
                {
                    "key": timeline_key,
                    "label": timeline_label,
                    "status": timeline_status,
                }
            )
        report["timeline"] = timeline
        record.report = report

    @staticmethod
    def _get_or_raise(session: Session, analysis_id: uuid.UUID) -> AnalysisRecord:
        record = session.get(AnalysisRecord, analysis_id)
        if record is None:
            raise NotFoundError()
        return record

    def create_analyzing(
        self,
        *,
        analysis_id: uuid.UUID,
        original_sql: str,
        normalized_sql: str,
        operation: str,
        target_schema: str,
        target_table: str,
        source: str,
        reason: str | None,
    ) -> AnalysisRecord:
        record = AnalysisRecord(
            id=analysis_id,
            original_sql=original_sql,
            normalized_sql=normalized_sql,
            operation=operation,
            target_schema=target_schema,
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

    def approve_pending(
        self,
        analysis_id: uuid.UUID,
        *,
        actor: str | None = None,
        reason: str | None = None,
    ) -> AnalysisRecord:
        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            updated_id = session.execute(
                update(AnalysisRecord)
                .where(
                    AnalysisRecord.id == analysis_id,
                    AnalysisRecord.status == "PENDING_APPROVAL",
                )
                .values(
                    status="APPROVED",
                    approved_at=now,
                    approved_by=actor,
                    approval_reason=reason,
                )
                .returning(AnalysisRecord.id)
            ).scalar_one_or_none()
            if updated_id is None:
                record = self._get_or_raise(session, analysis_id)
                raise InvalidStateError(
                    f"Analysis cannot be approved from status {record.status}."
                )
            record = self._get_or_raise(session, analysis_id)
            self._sync_report(
                record,
                status="APPROVED",
                timeline_key="approval",
                timeline_label="Human approval recorded",
                timeline_status="complete",
            )
            session.commit()
            session.refresh(record)
            session.expunge(record)
            return record

    def reject_pending(
        self,
        analysis_id: uuid.UUID,
        *,
        actor: str | None = None,
        reason: str | None = None,
    ) -> AnalysisRecord:
        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            updated_id = session.execute(
                update(AnalysisRecord)
                .where(
                    AnalysisRecord.id == analysis_id,
                    AnalysisRecord.status == "PENDING_APPROVAL",
                )
                .values(
                    status="REJECTED",
                    rejected_at=now,
                    rejected_by=actor,
                    rejection_reason=reason,
                )
                .returning(AnalysisRecord.id)
            ).scalar_one_or_none()
            if updated_id is None:
                record = self._get_or_raise(session, analysis_id)
                raise InvalidStateError(
                    f"Analysis cannot be rejected from status {record.status}."
                )
            record = self._get_or_raise(session, analysis_id)
            self._sync_report(
                record,
                status="REJECTED",
                timeline_key="approval",
                timeline_label="Analysis rejected by human",
                timeline_status="rejected",
            )
            session.commit()
            session.refresh(record)
            session.expunge(record)
            return record

    def claim_approved_for_execution(self, analysis_id: uuid.UUID) -> AnalysisRecord:
        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            updated_id = session.execute(
                update(AnalysisRecord)
                .where(
                    AnalysisRecord.id == analysis_id,
                    AnalysisRecord.status == "APPROVED",
                    AnalysisRecord.execution_claimed_at.is_(None),
                )
                .values(execution_claimed_at=now)
                .returning(AnalysisRecord.id)
            ).scalar_one_or_none()
            if updated_id is None:
                record = self._get_or_raise(session, analysis_id)
                if record.status != "APPROVED":
                    raise ApprovalRequiredError()
                raise ExecutionFailedError(
                    "Execution has already been claimed for this analysis."
                )
            session.commit()
            record = self._get_or_raise(session, analysis_id)
            session.expunge(record)
            return record

    def mark_stale(self, analysis_id: uuid.UUID) -> AnalysisRecord:
        with self._session_factory() as session:
            record = self._get_or_raise(session, analysis_id)
            if record.status != "APPROVED":
                raise InvalidStateError(
                    f"Analysis cannot become stale from status {record.status}."
                )
            record.status = "STALE"
            self._sync_report(
                record,
                status="STALE",
                timeline_key="revalidation",
                timeline_label="Production state changed; re-analysis required",
                timeline_status="stale",
            )
            session.commit()
            session.refresh(record)
            session.expunge(record)
            return record

    def mark_executed(
        self,
        analysis_id: uuid.UUID,
        *,
        affected_rows: int,
    ) -> AnalysisRecord:
        now = datetime.now(timezone.utc)
        with self._session_factory() as session:
            record = self._get_or_raise(session, analysis_id)
            if record.status != "APPROVED" or record.execution_claimed_at is None:
                raise InvalidStateError(
                    f"Analysis cannot be marked executed from status {record.status}."
                )
            record.status = "EXECUTED"
            record.executed_at = now
            record.execution_affected_rows = affected_rows
            self._sync_report(
                record,
                status="EXECUTED",
                timeline_key="execution",
                timeline_label="Approved SQL executed",
                timeline_status="complete",
            )
            session.commit()
            session.refresh(record)
            session.expunge(record)
            return record

    def mark_failed(
        self,
        analysis_id: uuid.UUID,
        *,
        code: str = "ANALYSIS_FAILED",
        message: str = "Analysis failed.",
    ) -> None:
        with self._session_factory() as session:
            record = session.get(AnalysisRecord, analysis_id)
            if record is None:
                return
            if record.status in {"EXECUTED", "REJECTED", "STALE"}:
                return
            record.status = "FAILED"
            record.failure_code = code
            record.failure_message = message
            self._sync_report(
                record,
                status="FAILED",
                timeline_key="failure",
                timeline_label="BlastShield operation failed",
                timeline_status="failed",
            )
            session.commit()

    def get(self, analysis_id: uuid.UUID) -> AnalysisRecord:
        with self._session_factory() as session:
            record = self._get_or_raise(session, analysis_id)
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
