from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import TournamentPredictionOptionType, TournamentPredictionQuestionStatus
from app.schemas.team import TeamRead


class TournamentPredictionOptionCreate(BaseModel):
    team_id: int | None = None
    label: str = Field(min_length=1, max_length=255)
    sort_order: int = 0


class TournamentPredictionOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    team_id: int | None
    label: str
    sort_order: int
    team: TeamRead | None = None
    created_at: datetime
    updated_at: datetime


class TournamentPredictionQuestionCreate(BaseModel):
    code: str = Field(min_length=1, max_length=128)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    option_type: TournamentPredictionOptionType
    status: TournamentPredictionQuestionStatus = TournamentPredictionQuestionStatus.draft
    points: int = Field(ge=0, default=0)
    lock_at: datetime | None = None


class TournamentPredictionResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    correct_option_id: int | None
    correct_text: str | None
    resolved_by_user_id: int | None
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TournamentPredictionQuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tournament_id: int
    code: str
    title: str
    description: str | None
    option_type: TournamentPredictionOptionType
    status: TournamentPredictionQuestionStatus
    points: int
    lock_at: datetime | None
    resolved_at: datetime | None
    options: list[TournamentPredictionOptionRead] = Field(default_factory=list)
    result: TournamentPredictionResultRead | None = None
    created_at: datetime
    updated_at: datetime
