import uuid
from datetime import datetime
from typing import Any, ClassVar

from sqlalchemy import DateTime, Integer, String, Text, Uuid, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class AnalysisRecord(Base):
    __tablename__ = "analyses"
    __table_args__: ClassVar[dict[str, str]] = {"schema": "blastshield_control"}

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    original_sql: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_sql: Mapped[str] = mapped_column(Text, nullable=False)
    operation: Mapped[str] = mapped_column(String, nullable=False)
    target_schema: Mapped[str] = mapped_column(String, nullable=False, default="public")
    target_table: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, nullable=False)
    report: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    risk_score: Mapped[int | None] = mapped_column(Integer)
    risk_level: Mapped[str | None] = mapped_column(String)
    fingerprint: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[str | None] = mapped_column(Text)
    approval_reason: Mapped[str | None] = mapped_column(Text)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    rejected_by: Mapped[str | None] = mapped_column(Text)
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    execution_claimed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    execution_affected_rows: Mapped[int | None] = mapped_column(Integer)
    failure_code: Mapped[str | None] = mapped_column(String)
    failure_message: Mapped[str | None] = mapped_column(Text)
