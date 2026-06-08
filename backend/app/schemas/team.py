from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import TeamConfederation, TeamStatus


class TeamBase(BaseModel):
    slug: str = Field(min_length=1, max_length=128)
    name: str = Field(min_length=1, max_length=255)
    short_name: str | None = Field(default=None, max_length=128)
    fifa_code: str | None = Field(default=None, max_length=8)
    flag_emoji: str | None = Field(default=None, max_length=16)
    logo_url: str | None = Field(default=None, max_length=1024)
    confederation: TeamConfederation = TeamConfederation.other
    status: TeamStatus = TeamStatus.active
    is_national_team: bool = True
    is_placeholder: bool = False


class TeamCreate(TeamBase):
    pass


class TeamRead(TeamBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
