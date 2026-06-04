from pydantic import BaseModel

from app.schemas.user import UserProfile


class TelegramAuthRequest(BaseModel):
    init_data: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class BotUserUpsertRequest(BaseModel):
    telegram_id: int
    username: str | None = None
    first_name: str | None = None


class DevAuthRequest(BaseModel):
    telegram_id: int = 12345
    username: str | None = "dev_admin"
    first_name: str | None = "Dev Admin"
