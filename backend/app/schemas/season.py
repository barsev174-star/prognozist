from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import SeasonStatus


class SeasonBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    start_date: date
    end_date: date
    status: SeasonStatus = SeasonStatus.upcoming


class SeasonCreate(SeasonBase):
    pass


class SeasonUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: SeasonStatus | None = None


class SeasonRead(SeasonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

