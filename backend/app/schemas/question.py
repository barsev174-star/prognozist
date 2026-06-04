from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class QuestionCreate(BaseModel):
    match_id: int
    text: str = Field(min_length=1)
    points: int = Field(default=3, gt=0)


class QuestionUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1)
    correct_answer: bool | None = None
    points: int | None = Field(default=None, gt=0)


class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    match_id: int
    text: str
    correct_answer: bool | None
    points: int
    created_at: datetime
    updated_at: datetime

