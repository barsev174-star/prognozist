from datetime import UTC, datetime, timedelta

from aiogram import F, Router
from aiogram.types import LabeledPrice, Message, PreCheckoutQuery

from config import settings
from services.api_client import confirm_vip_payment, format_premium_until, upsert_bot_user

router = Router()


@router.message(F.text == "💎 VIP")
async def handle_vip_button(message: Message) -> None:
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    await message.answer_invoice(
        title="VIP подписка",
        description=f"VIP доступ на {settings.vip_default_duration_days} дней",
        payload=f"vip:{message.from_user.id}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label="VIP", amount=settings.vip_stars_amount)],
    )


@router.pre_checkout_query()
async def handle_pre_checkout(pre_checkout_query: PreCheckoutQuery) -> None:
    await pre_checkout_query.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(message: Message) -> None:
    payment = message.successful_payment
    invite_link = await create_vip_invite_link(message)

    result = await confirm_vip_payment(
        telegram_id=message.from_user.id,
        telegram_payment_charge_id=payment.telegram_payment_charge_id,
        stars_amount=payment.total_amount,
        duration_days=settings.vip_default_duration_days,
        invite_link=invite_link,
    )

    text = f"VIP активирован до {format_premium_until(result.get('premium_until'))}."
    if invite_link:
        text += f"\n\nСсылка в закрытый канал:\n{invite_link}"
    else:
        text += "\n\nСсылка в закрытый канал будет доступна после настройки канала."

    await message.answer(text)


async def create_vip_invite_link(message: Message) -> str | None:
    if not settings.telegram_vip_channel_id:
        return None

    expires_at = datetime.now(UTC) + timedelta(days=settings.vip_default_duration_days)
    invite = await message.bot.create_chat_invite_link(
        chat_id=settings.telegram_vip_channel_id,
        expire_date=expires_at,
        member_limit=1,
        creates_join_request=False,
        name=f"vip_{message.from_user.id}",
    )
    return invite.invite_link
