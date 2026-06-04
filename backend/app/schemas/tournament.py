from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import TournamentStatus


class TournamentBase(BaseModel):
    season_id: int
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    start_date: date
    end_date: date
    status: TournamentStatus = TournamentStatus.upcoming


class TournamentCreate(TournamentBase):
    pass


class TournamentUpdate(BaseModel):
    season_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: TournamentStatus | None = None


class TournamentRead(TournamentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TournamentCompletionReadinessRead(BaseModel):
    total_matches: int
    completed_matches: int
    can_complete: bool


class TournamentCompletionResultRead(BaseModel):
    tournament_id: int
    tournament_results_created: int
    leagues_archived: int
    league_results_created: int
