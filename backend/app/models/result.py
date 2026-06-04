from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TournamentResult(Base):
    __tablename__ = "tournament_results"
    __table_args__ = (
        UniqueConstraint("tournament_id", "user_id", name="uq_tournament_results_tournament_user"),
        UniqueConstraint("tournament_id", "final_rank", name="uq_tournament_results_tournament_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    final_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    final_points: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    tournament: Mapped["Tournament"] = relationship()
    user: Mapped["User"] = relationship()


class LeagueResult(Base):
    __tablename__ = "league_results"
    __table_args__ = (
        UniqueConstraint("league_id", "user_id", name="uq_league_results_league_user"),
        UniqueConstraint("league_id", "final_rank", name="uq_league_results_league_rank"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    league_id: Mapped[int] = mapped_column(ForeignKey("leagues.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    final_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    final_points: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    league: Mapped["League"] = relationship()
    user: Mapped["User"] = relationship()
