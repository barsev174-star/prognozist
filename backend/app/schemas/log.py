from datetime import datetime

from pydantic import BaseModel


class AdminSystemLogRead(BaseModel):
    id: int
    event_type: str
    user_id: int | None
    telegram_id: int | None
    username: str | None
    first_name: str | None
    payload_json: dict | None
    created_at: datetime


class AdminPointsLogRead(BaseModel):
    id: int
    user_id: int
    telegram_id: int | None
    username: str | None
    first_name: str | None
    source_type: str
    source_id: int
    points: int
    created_at: datetime
