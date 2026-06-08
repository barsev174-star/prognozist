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


class TournamentPredictionQuestionUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=128)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    option_type: TournamentPredictionOptionType | None = None
    status: TournamentPredictionQuestionStatus | None = None
    points: int | None = Field(default=None, ge=0)
    lock_at: datetime | None = None


class TournamentPredictionOptionUpdate(BaseModel):
    team_id: int | None = None
    label: str | None = Field(default=None, min_length=1, max_length=255)
    sort_order: int | None = None


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


class TournamentPredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int
    user_id: int
    selected_option_id: int | None
    free_text: str | None
    points_awarded: int | None
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime


class TournamentPredictionAnswerCreate(BaseModel):
    selected_option_id: int | None = None
    free_text: str | None = None


class TournamentPredictionResolve(BaseModel):
    correct_option_id: int | None = None
    correct_text: str | None = None


class TournamentPredictionResolutionSummaryRead(BaseModel):
    total_predictions: int
    correct_predictions: int
    total_points_awarded: int


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
    resolution_summary: TournamentPredictionResolutionSummaryRead | None = None
    created_at: datetime
    updated_at: datetime


class TournamentPredictionQuestionWithUserRead(TournamentPredictionQuestionRead):
    user_prediction: TournamentPredictionRead | None = None
