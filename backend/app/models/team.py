import enum

from sqlalchemy import Boolean, Enum, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin


class TeamConfederation(str, enum.Enum):
    uefa = "uefa"
    conmebol = "conmebol"
    concacaf = "concacaf"
    caf = "caf"
    afc = "afc"
    ofc = "ofc"
    other = "other"


class TeamStatus(str, enum.Enum):
    active = "active"
    archived = "archived"


class Team(TimestampMixin, Base):
    __tablename__ = "teams"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_teams_slug"),
        UniqueConstraint("fifa_code", name="uq_teams_fifa_code"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    short_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    fifa_code: Mapped[str | None] = mapped_column(String(8), nullable=True)
    flag_emoji: Mapped[str | None] = mapped_column(String(16), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    confederation: Mapped[TeamConfederation] = mapped_column(
        Enum(TeamConfederation, name="team_confederation"),
        nullable=False,
        default=TeamConfederation.other,
        server_default=TeamConfederation.other.value,
    )
    status: Mapped[TeamStatus] = mapped_column(
        Enum(TeamStatus, name="team_status"),
        nullable=False,
        default=TeamStatus.active,
        server_default=TeamStatus.active.value,
    )
    is_national_team: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    is_placeholder: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
