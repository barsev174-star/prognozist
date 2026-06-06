from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpertPredictionCreate(BaseModel):
    match_id: int
    predicted_team_1_score: int = Field(ge=0)
    predicted_team_2_score: int = Field(ge=0)
    question_answer: bool | None = None
    question_2_answer: bool | None = None
    vip_question_answer: bool | None = None


class ExpertPredictionUpdate(BaseModel):
    predicted_team_1_score: int | None = Field(default=None, ge=0)
    predicted_team_2_score: int | None = Field(default=None, ge=0)
    question_answer: bool | None = None
    question_2_answer: bool | None = None
    vip_question_answer: bool | None = None


class ExpertPredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    match_id: int
    expert_user_id: int | None
    predicted_team_1_score: int
    predicted_team_2_score: int
    question_answer: bool | None
    question_2_answer: bool | None
    vip_question_answer: bool | None
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

