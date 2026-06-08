from datetime import UTC, datetime, timedelta

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice, Message, PreCheckoutQuery

from config import settings
from keyboards.main_menu import DONATION_LABEL
from services.api_client import confirm_donation_payment, confirm_vip_payment, format_premium_until, upsert_bot_user

router = Router()

DONATION_PRESETS = (50, 100, 250, 500)
DONATION_MIN_AMOUNT = 1
DONATION_MAX_AMOUNT = 10000

VIP_TITLE = "VIP \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0430"
VIP_DESCRIPTION = "VIP \u0434\u043e\u0441\u0442\u0443\u043f \u043d\u0430 {days} \u0434\u043d\u0435\u0439"
VIP_LINK_TEXT = "\n\n\u0421\u0441\u044b\u043b\u043a\u0430 \u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0439 \u043a\u0430\u043d\u0430\u043b:\n{invite_link}"
VIP_LINK_PENDING_TEXT = "\n\n\u0421\u0441\u044b\u043b\u043a\u0430 \u0432 \u0437\u0430\u043a\u0440\u044b\u0442\u044b\u0439 \u043a\u0430\u043d\u0430\u043b \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043f\u043e\u0441\u043b\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043a\u0430\u043d\u0430\u043b\u0430."
VIP_ACTIVATED_TEXT = "VIP \u0430\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u043d \u0434\u043e {premium_until}."

DONATION_PROMPT = "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0443\u043c\u043c\u0443 \u0434\u043e\u043d\u0430\u0442\u0430 \u0432 Stars \u0438\u043b\u0438 \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0432\u043e\u044e."
DONATION_CUSTOM_PROMPT = "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0443\u043c\u043c\u0443 \u0434\u043e\u043d\u0430\u0442\u0430 \u0447\u0438\u0441\u043b\u043e\u043c \u043e\u0442 {min_amount} \u0434\u043e {max_amount} Stars."
DONATION_INVALID_CALLBACK = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c \u0441\u0443\u043c\u043c\u0443."
DONATION_INVALID_AMOUNT = "\u041d\u0443\u0436\u043d\u0430 \u0446\u0435\u043b\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u043e\u0442 {min_amount} \u0434\u043e {max_amount} Stars. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437."
DONATION_TITLE = "\u0414\u043e\u043d\u0430\u0442 Prognozist"
DONATION_DESCRIPTION = "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u043d\u0430 {amount} Stars"
DONATION_LABEL_TEXT = "\u0414\u043e\u043d\u0430\u0442"
DONATION_CUSTOM_BUTTON = "\u0421\u0432\u043e\u044f \u0441\u0443\u043c\u043c\u0430"
DONATION_THANKS = "\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443."

CHECKOUT_ERROR = "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u043f\u043b\u0430\u0442\u0435\u0436. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0435 \u0440\u0430\u0437."
UNKNOWN_PAYMENT_ERROR = "\u041f\u043b\u0430\u0442\u0435\u0436 \u043f\u043e\u043b\u0443\u0447\u0435\u043d, \u043d\u043e \u043d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438\u0442\u044c \u0435\u0433\u043e \u0442\u0438\u043f. \u041d\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u0432 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443."


class DonationAmountState(StatesGroup):
    waiting_for_amount = State()


@router.message(F.text == "VIP")
async def handle_vip_button(message: Message) -> None:
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    await message.answer_invoice(
        title=VIP_TITLE,
        description=VIP_DESCRIPTION.format(days=settings.vip_default_duration_days),
        payload=f"vip:{message.from_user.id}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label="VIP", amount=settings.vip_stars_amount)],
    )


@router.message(F.text == DONATION_LABEL)
async def handle_donation_button(message: Message, state: FSMContext) -> None:
    await state.clear()
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    await message.answer(
        DONATION_PROMPT,
        reply_markup=build_donation_keyboard(),
    )


@router.callback_query(F.data.startswith("donation:"))
async def handle_donation_callback(callback: CallbackQuery, state: FSMContext) -> None:
    if callback.data == "donation:custom":
        await state.set_state(DonationAmountState.waiting_for_amount)
        await callback.message.answer(
            DONATION_CUSTOM_PROMPT.format(min_amount=DONATION_MIN_AMOUNT, max_amount=DONATION_MAX_AMOUNT)
        )
        await callback.answer()
        return

    amount = parse_callback_amount(callback.data)
    if amount is None:
        await callback.answer(DONATION_INVALID_CALLBACK, show_alert=True)
        return

    await state.clear()
    await send_donation_invoice(callback.message, callback.from_user.id, amount)
    await callback.answer()


@router.message(DonationAmountState.waiting_for_amount)
async def handle_custom_donation_amount(message: Message, state: FSMContext) -> None:
    amount = parse_custom_amount(message.text)
    if amount is None:
        await message.answer(
            DONATION_INVALID_AMOUNT.format(min_amount=DONATION_MIN_AMOUNT, max_amount=DONATION_MAX_AMOUNT)
        )
        return

    await state.clear()
    await send_donation_invoice(message, message.from_user.id, amount)


@router.pre_checkout_query()
async def handle_pre_checkout(pre_checkout_query: PreCheckoutQuery) -> None:
    payload = parse_payment_payload(pre_checkout_query.invoice_payload)
    if payload is None or payload.telegram_id != pre_checkout_query.from_user.id:
        await pre_checkout_query.answer(ok=False, error_message=CHECKOUT_ERROR)
        return

    await pre_checkout_query.answer(ok=True)


@router.message(F.successful_payment)
async def handle_successful_payment(message: Message) -> None:
    payment = message.successful_payment
    payload = parse_payment_payload(payment.invoice_payload)
    if payload is None:
        await message.answer(UNKNOWN_PAYMENT_ERROR)
        return

    if payload.kind == "vip":
        invite_link = await create_vip_invite_link(message)
        result = await confirm_vip_payment(
            telegram_id=message.from_user.id,
            telegram_payment_charge_id=payment.telegram_payment_charge_id,
            stars_amount=payment.total_amount,
            duration_days=settings.vip_default_duration_days,
            invite_link=invite_link,
        )

        text = VIP_ACTIVATED_TEXT.format(premium_until=format_premium_until(result.get("premium_until")))
        if invite_link:
            text += VIP_LINK_TEXT.format(invite_link=invite_link)
        else:
            text += VIP_LINK_PENDING_TEXT

        await message.answer(text)
        return

    await confirm_donation_payment(
        telegram_id=message.from_user.id,
        telegram_payment_charge_id=payment.telegram_payment_charge_id,
        stars_amount=payment.total_amount,
    )
    await message.answer(DONATION_THANKS)


async def send_donation_invoice(message: Message, telegram_id: int, amount: int) -> None:
    await message.answer_invoice(
        title=DONATION_TITLE,
        description=DONATION_DESCRIPTION.format(amount=amount),
        payload=f"donation:{telegram_id}:{amount}",
        provider_token="",
        currency="XTR",
        prices=[LabeledPrice(label=DONATION_LABEL_TEXT, amount=amount)],
    )


def build_donation_keyboard() -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(text=f"{DONATION_PRESETS[0]} Stars", callback_data=f"donation:{DONATION_PRESETS[0]}"),
            InlineKeyboardButton(text=f"{DONATION_PRESETS[1]} Stars", callback_data=f"donation:{DONATION_PRESETS[1]}"),
        ],
        [
            InlineKeyboardButton(text=f"{DONATION_PRESETS[2]} Stars", callback_data=f"donation:{DONATION_PRESETS[2]}"),
            InlineKeyboardButton(text=f"{DONATION_PRESETS[3]} Stars", callback_data=f"donation:{DONATION_PRESETS[3]}"),
        ],
        [InlineKeyboardButton(text=DONATION_CUSTOM_BUTTON, callback_data="donation:custom")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def parse_callback_amount(data: str | None) -> int | None:
    if data is None:
        return None
    _, _, raw_amount = data.partition(":")
    return parse_custom_amount(raw_amount)


def parse_custom_amount(value: str | None) -> int | None:
    if value is None or not value.isdigit():
        return None

    amount = int(value)
    if amount < DONATION_MIN_AMOUNT or amount > DONATION_MAX_AMOUNT:
        return None
    return amount


class PaymentPayload:
    def __init__(self, kind: str, telegram_id: int, amount: int | None = None) -> None:
        self.kind = kind
        self.telegram_id = telegram_id
        self.amount = amount


def parse_payment_payload(payload: str | None) -> PaymentPayload | None:
    if payload is None:
        return None

    parts = payload.split(":")
    if len(parts) == 2 and parts[0] == "vip" and parts[1].isdigit():
        return PaymentPayload(kind="vip", telegram_id=int(parts[1]))

    if len(parts) == 3 and parts[0] == "donation" and parts[1].isdigit() and parts[2].isdigit():
        return PaymentPayload(kind="donation", telegram_id=int(parts[1]), amount=int(parts[2]))

    return None


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
