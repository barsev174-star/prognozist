from datetime import datetime

from pydantic import BaseModel


class AchievementItem(BaseModel):
    id: int
    code: str
    name: str
    description: str | None
    share_template: str | None
    earned_at: datetime | None = None
    share_card_url: str | None = None
    is_earned: bool


class AchievementShareResponse(BaseModel):
    text: str
    share_card_url: str | None = None

