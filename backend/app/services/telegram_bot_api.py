from datetime import UTC, datetime

import httpx

from app.core.config import settings
from app.schemas.star import AdminStarTransactionRead, StarAmountRead
from datetime import UTC, datetime, timedelta

BOT_API_BASE_URL = "https://api.telegram.org"


def _call_bot_api(method: str, payload: dict | None = None) -> dict:
    if not settings.bot_token or settings.bot_token == "change-me":
        raise RuntimeError("Bot token is not configured")

    response = httpx.post(
        f"{BOT_API_BASE_URL}/bot{settings.bot_token}/{method}",
        json=payload or {},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    if not data.get("ok"):
        raise RuntimeError(data.get("description") or f"Telegram Bot API call failed: {method}")
    return data["result"]


def get_my_star_balance() -> StarAmountRead:
    result = _call_bot_api("getMyStarBalance")
    return StarAmountRead(
        amount=int(result.get("amount", 0)),
        nanostar_amount=result.get("nanostar_amount"),
    )


def get_star_transactions(limit: int = 20) -> list[AdminStarTransactionRead]:
    result = _call_bot_api("getStarTransactions", {"offset": 0, "limit": min(max(limit, 1), 100)})
    rows = result.get("transactions", [])
    return [_parse_star_transaction(row) for row in rows]
    
def create_vip_channel_invite_link(telegram_user_id: int, duration_days: int) -> str:
    if not settings.telegram_vip_channel_id:
        raise RuntimeError("VIP channel is not configured")

    expire_at = datetime.now(UTC) + timedelta(days=max(duration_days, 1))
    result = _call_bot_api(
        "createChatInviteLink",
        {
            "chat_id": settings.telegram_vip_channel_id,
            "member_limit": 1,
            "creates_join_request": False,
            "expire_date": int(expire_at.timestamp()),
            "name": f"vip-{telegram_user_id}-{int(datetime.now(UTC).timestamp())}",
        },
    )
    invite_link = result.get("invite_link")
    if not invite_link:
        raise RuntimeError("Telegram did not return invite link")
    return invite_link    


def notify_admins(text: str) -> None:
    if not settings.admin_ids:
        return

    for admin_id in settings.admin_ids:
        try:
            _call_bot_api(
                "sendMessage",
                {
                    "chat_id": admin_id,
                    "text": text,
                },
            )
        except (httpx.HTTPError, RuntimeError):
            continue


def _parse_star_transaction(row: dict) -> AdminStarTransactionRead:
    star_amount = row.get("amount") or {}
    partner = row.get("partner") or row.get("source") or {}
    partner_type = str(partner.get("type") or "other")
    transaction_type = partner.get("transaction_type")

    if partner_type == "user":
        user = partner.get("user") or {}
        title = user.get("first_name") or user.get("username") or f"user {user.get('id', '-')}"
    elif partner_type == "chat":
        chat = partner.get("chat") or {}
        title = chat.get("title") or chat.get("username") or f"chat {chat.get('id', '-')}"
    elif partner_type == "telegram_api":
        title = "Telegram API"
    elif partner_type == "fragment":
        title = "Fragment"
    elif partner_type == "telegram_ads":
        title = "Telegram Ads"
    else:
        title = "Unknown source"

    return AdminStarTransactionRead(
        id=str(row.get("id", "")),
        amount=int(star_amount.get("amount", 0)),
        nanostar_amount=star_amount.get("nanostar_amount"),
        is_refund=bool(row.get("is_refund", False)),
        created_at=datetime.fromtimestamp(int(row.get("date", 0)), tz=UTC),
        partner_type=partner_type,
        transaction_type=transaction_type,
        title=title,
    )
