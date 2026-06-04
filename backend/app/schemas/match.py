from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import MatchStatus
from app.schemas.question import QuestionRead


class MatchBase(BaseModel):
    tournament_id: int
    team_1: str = Field(min_length=1, max_length=255)
    team_2: str = Field(min_length=1, max_length=255)
    team_1_logo: str | None = Field(default=None, max_length=1024)
    team_2_logo: str | None = Field(default=None, max_length=1024)
    start_time: datetime
    status: MatchStatus = MatchStatus.upcoming


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    tournament_id: int | None = None
    team_1: str | None = Field(default=None, min_length=1, max_length=255)
    team_2: str | None = Field(default=None, min_length=1, max_length=255)
    team_1_logo: str | None = Field(default=None, max_length=1024)
    team_2_logo: str | None = Field(default=None, max_length=1024)
    start_time: datetime | None = None
    status: MatchStatus | None = None


class MatchResultUpdate(BaseModel):
    team_1_score: int = Field(ge=0)
    team_2_score: int = Field(ge=0)
    public_correct_answer: bool | None = None
    vip_correct_answer: bool | None = None


class MatchRead(MatchBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_1_score: int | None
    team_2_score: int | None
    created_at: datetime
    updated_at: datetime


class MatchDetailRead(MatchRead):
    public_question: QuestionRead | None = None
    vip_question: QuestionRead | None = None
    vip_question_locked: bool = True


class MatchQuestionsRead(BaseModel):
    public_question: QuestionRead | None = None
    vip_question: QuestionRead | None = None
