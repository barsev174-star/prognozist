from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SystemLog(Base):
    __tablename__ = "system_logs"
    __table_args__ = (
        Index("ix_system_logs_event_type", "event_type"),
        Index("ix_system_logs_user_id", "user_id"),
        Index("ix_system_logs_created_at", "created_at"),
        Index("ix_system_logs_payload_json", "payload_json", postgresql_using="gin"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(128), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    payload_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User | None"] = relationship()


class PointsLog(Base):
    __tablename__ = "points_log"
    __table_args__ = (
        UniqueConstraint("user_id", "source_type", "source_id", name="uq_points_log_user_source"),
        Index("ix_points_log_user_id", "user_id"),
        Index("ix_points_log_source", "source_type", "source_id"),
        Index("ix_points_log_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    source_id: Mapped[int] = mapped_column(Integer, nullable=False)
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship()
