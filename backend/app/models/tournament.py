import enum
from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class TournamentStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"


class Tournament(TimestampMixin, Base):
    __tablename__ = "tournaments"
    __table_args__ = (
        CheckConstraint("start_date <= end_date", name="ck_tournaments_date_range"),
        Index("ix_tournaments_season_id", "season_id"),
        Index("ix_tournaments_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id", ondelete="RESTRICT"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[TournamentStatus] = mapped_column(
        Enum(TournamentStatus, name="tournament_status"),
        nullable=False,
        default=TournamentStatus.upcoming,
        server_default=TournamentStatus.upcoming.value,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    season: Mapped["Season"] = relationship(back_populates="tournaments")
