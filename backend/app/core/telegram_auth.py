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


def _validate_auth_date(auth_date_raw: str | int | None, max_age_seconds: int) -> None:
    if auth_date_raw is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram auth date is missing")

    try:
        auth_date = datetime.fromtimestamp(int(auth_date_raw), tz=UTC)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram auth date is invalid") from exc

    if (datetime.now(UTC) - auth_date).total_seconds() > max_age_seconds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram auth data is expired")


def validate_telegram_init_data(init_data: str, max_age_seconds: int = 86400) -> TelegramUserData:
    parsed = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram hash is missing")

    auth_date_raw = parsed.get("auth_date")
    _validate_auth_date(auth_date_raw, max_age_seconds)

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


def validate_telegram_login_widget_data(payload: dict[str, str | int | None], max_age_seconds: int = 86400) -> TelegramUserData:
    received_hash = payload.get("hash")
    if not isinstance(received_hash, str) or not received_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram hash is missing")

    _validate_auth_date(payload.get("auth_date"), max_age_seconds)

    check_values = {key: value for key, value in payload.items() if key != "hash" and value not in (None, "")}
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(check_values.items()))
    secret_key = hashlib.sha256(settings.bot_token.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram login data is invalid")

    telegram_id = payload.get("id")
    if not isinstance(telegram_id, int):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Telegram user id is invalid")

    return TelegramUserData(
        telegram_id=telegram_id,
        username=payload.get("username") if isinstance(payload.get("username"), str) else None,
        first_name=payload.get("first_name") if isinstance(payload.get("first_name"), str) else None,
        start_param=None,
    )

