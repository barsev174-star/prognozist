from datetime import datetime

import httpx

from config import settings


async def upsert_bot_user(telegram_id: int, username: str | None, first_name: str | None) -> dict:
    async with httpx.AsyncClient(base_url=settings.backend_url, timeout=10) as client:
        response = await client.post(
            "/api/v1/auth/bot-user",
            headers={"X-Bot-Internal-Token": settings.bot_internal_token},
            json={
                "telegram_id": telegram_id,
                "username": username,
                "first_name": first_name,
            },
        )
        response.raise_for_status()
        return response.json()


async def confirm_vip_payment(
    telegram_id: int,
    telegram_payment_charge_id: str,
    stars_amount: int,
    duration_days: int,
    invite_link: str | None,
) -> dict:
    async with httpx.AsyncClient(base_url=settings.backend_url, timeout=10) as client:
        response = await client.post(
            "/api/v1/vip/payment/confirm",
            headers={"X-Bot-Internal-Token": settings.bot_internal_token},
            json={
                "telegram_id": telegram_id,
                "telegram_payment_charge_id": telegram_payment_charge_id,
                "stars_amount": stars_amount,
                "duration_days": duration_days,
                "invite_link": invite_link,
            },
        )
        response.raise_for_status()
        return response.json()


async def confirm_donation_payment(
    telegram_id: int,
    telegram_payment_charge_id: str,
    stars_amount: int,
) -> dict:
    async with httpx.AsyncClient(base_url=settings.backend_url, timeout=10) as client:
        response = await client.post(
            "/api/v1/payments/donations/confirm",
            headers={"X-Bot-Internal-Token": settings.bot_internal_token},
            json={
                "telegram_id": telegram_id,
                "telegram_payment_charge_id": telegram_payment_charge_id,
                "stars_amount": stars_amount,
            },
        )
        response.raise_for_status()
        return response.json()


def format_premium_until(value: str | None) -> str:
    if value is None:
        return "\u043d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e"
    try:
        return datetime.fromisoformat(value).strftime("%d.%m.%Y")
    except ValueError:
        return value
