from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AnswerCreate(BaseModel):
    answer: bool


class QuestionAnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    question_id: int
    answer: bool
    is_correct: bool | None
    points_awarded: int
    created_at: datetime
    updated_at: datetime


class VipQuestionAnswerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    vip_question_id: int
    answer: bool
    is_correct: bool | None
    points_awarded: int
    created_at: datetime
    updated_at: datetime

