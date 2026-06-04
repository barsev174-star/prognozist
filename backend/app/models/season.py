import enum
from datetime import date

from sqlalchemy import CheckConstraint, Date, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class SeasonStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"


class Season(TimestampMixin, Base):
    __tablename__ = "seasons"
    __table_args__ = (CheckConstraint("start_date <= end_date", name="ck_seasons_date_range"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[SeasonStatus] = mapped_column(
        Enum(SeasonStatus, name="season_status"),
        nullable=False,
        default=SeasonStatus.upcoming,
        server_default=SeasonStatus.upcoming.value,
    )

    tournaments: Mapped[list["Tournament"]] = relationship(back_populates="season")

