import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from urllib.parse import parse_qsl

from fastapi import HTTPException, status

from app.core.config import settings


@dataclass(frozen=True)
class TelegramUserData:
    telegram_id: int
    username: str | None
    first_name: str | None
    start_param: str | None


def validate_telegram_init_data(init_data: str, max_age_seconds: int = 86400) -> TelegramUserData:
    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram hash is missing")

    auth_date_raw = parsed.get("auth_date")
    if not auth_date_raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram auth date is missing")

    try:
        auth_date = datetime.fromtimestamp(int(auth_date_raw), tz=UTC)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram auth date is invalid") from exc

    if (datetime.now(UTC) - auth_date).total_seconds() > max_age_seconds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram init data is expired")

    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(parsed.items()))
    secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram init data is invalid")

    user_raw = parsed.get("user")
    if not user_raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram user is missing")

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram user is invalid") from exc

    telegram_id = user.get("id")
    if not isinstance(telegram_id, int):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram user id is invalid")

    return TelegramUserData(
        telegram_id=telegram_id,
        username=user.get("username"),
        first_name=user.get("first_name"),
        start_param=parsed.get("start_param"),
    )

