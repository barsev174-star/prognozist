from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PredictionCreate(BaseModel):
    match_id: int
    predicted_team_1_score: int = Field(ge=0)
    predicted_team_2_score: int = Field(ge=0)


class PredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    match_id: int
    predicted_team_1_score: int
    predicted_team_2_score: int
    points_awarded: int
    is_exact_score: bool
    is_outcome_correct: bool
    created_at: datetime
    updated_at: datetime

