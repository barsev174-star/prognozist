from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import LeagueStatus
from app.schemas.ranking import RankingResponse


class LeagueCreate(BaseModel):
    tournament_id: int
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    prize_description: str | None = None


class LeagueJoinRequest(BaseModel):
    invite_code: str = Field(min_length=1, max_length=64)


class LeagueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    tournament_id: int
    name: str
    description: str | None
    prize_description: str | None
    invite_code: str
    status: LeagueStatus
    created_at: datetime
    completed_at: datetime | None
    updated_at: datetime


class LeagueDetail(LeagueRead):
    members_count: int
    is_owner: bool
    is_member: bool


class LeagueRankingResponse(BaseModel):
    league: LeagueDetail
    ranking: RankingResponse

