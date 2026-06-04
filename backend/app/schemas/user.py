from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict


class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    telegram_id: int
    username: str | None
    first_name: str | None
    points_total: int
    premium_until: datetime | None
    is_blocked: bool
    created_at: datetime

