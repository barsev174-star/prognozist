import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class LeagueStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class League(TimestampMixin, Base):
    __tablename__ = "leagues"
    __table_args__ = (
        Index("ix_leagues_owner_id", "owner_id"),
        Index("ix_leagues_tournament_id", "tournament_id"),
        UniqueConstraint("invite_code", name="uq_leagues_invite_code"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    prize_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    invite_code: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[LeagueStatus] = mapped_column(
        Enum(LeagueStatus, name="league_status"),
        nullable=False,
        default=LeagueStatus.active,
        server_default=LeagueStatus.active.value,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User"] = relationship()
    tournament: Mapped["Tournament"] = relationship()
    members: Mapped[list["LeagueMember"]] = relationship(back_populates="league", cascade="all, delete-orphan")


class LeagueMember(Base):
    __tablename__ = "league_members"

    league_id: Mapped[int] = mapped_column(ForeignKey("leagues.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    league: Mapped["League"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship()

