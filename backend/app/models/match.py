import enum
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class MatchStatus(str, enum.Enum):
    upcoming = "upcoming"
    live = "live"
    calculating = "calculating"
    completed = "completed"


class Match(TimestampMixin, Base):
    __tablename__ = "matches"
    __table_args__ = (
        CheckConstraint("team_1_score IS NULL OR team_1_score >= 0", name="ck_matches_team_1_score_non_negative"),
        CheckConstraint("team_2_score IS NULL OR team_2_score >= 0", name="ck_matches_team_2_score_non_negative"),
        Index("ix_matches_tournament_id", "tournament_id"),
        Index("ix_matches_start_time", "start_time"),
        Index("ix_matches_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    team_1_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team_2_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team_1: Mapped[str] = mapped_column(String(255), nullable=False)
    team_2: Mapped[str] = mapped_column(String(255), nullable=False)
    team_1_logo: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    team_2_logo: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus, name="match_status"),
        nullable=False,
        default=MatchStatus.upcoming,
        server_default=MatchStatus.upcoming.value,
    )
    team_1_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    team_2_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    tournament: Mapped["Tournament"] = relationship()
    team_1_ref: Mapped["Team | None"] = relationship(foreign_keys=[team_1_id])
    team_2_ref: Mapped["Team | None"] = relationship(foreign_keys=[team_2_id])
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="match", cascade="all, delete-orphan")
    questions: Mapped[list["Question"]] = relationship(back_populates="match", cascade="all, delete-orphan")
    vip_question: Mapped["VipQuestion | None"] = relationship(back_populates="match", cascade="all, delete-orphan")
