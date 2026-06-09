from aiogram import F, Router
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from keyboards.main_menu import (
    LEAGUES_LABEL,
    RANKING_LABEL,
    REFERRALS_LABEL,
    SUPPORT_LABEL,
    build_webapp_url,
    main_menu_keyboard,
)
from services.api_client import upsert_bot_user

router = Router()

MENU_PROMPT = "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0430\u0437\u0434\u0435\u043b:"
OPEN_APP_PROMPT = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c Mini App:"
OPEN_APP_LABEL = "Mini App"
RANKING_PROMPT = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u0435\u0439\u0442\u0438\u043d\u0433 \u0432 Mini App:"
LEAGUES_PROMPT = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0430\u0448\u0438 \u043b\u0438\u0433\u0438:"
REFERRALS_PROMPT = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u0435\u0444\u0435\u0440\u0430\u043b\u044b \u0432 Mini App:"
SUPPORT_PROMPT = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0443 \u0432 Mini App:"


@router.message(CommandStart())
async def handle_start(message: Message) -> None:
    await prepare_user(message)
    await message.answer(
        MENU_PROMPT,
        reply_markup=main_menu_keyboard(),
    )
    await message.answer(
        OPEN_APP_PROMPT,
        reply_markup=build_section_markup(OPEN_APP_LABEL, "/"),
    )


@router.message(F.text == RANKING_LABEL)
async def handle_ranking_button(message: Message) -> None:
    await prepare_user(message)
    await message.answer(RANKING_PROMPT, reply_markup=build_section_markup(RANKING_LABEL, "/rankings"))


@router.message(F.text == LEAGUES_LABEL)
async def handle_leagues_button(message: Message) -> None:
    await prepare_user(message)
    await message.answer(LEAGUES_PROMPT, reply_markup=build_section_markup(LEAGUES_LABEL, "/leagues"))


@router.message(F.text == REFERRALS_LABEL)
async def handle_referrals_button(message: Message) -> None:
    await prepare_user(message)
    await message.answer(REFERRALS_PROMPT, reply_markup=build_section_markup(REFERRALS_LABEL, "/referrals"))


@router.message(F.text == SUPPORT_LABEL)
async def handle_support_button(message: Message) -> None:
    await prepare_user(message)
    await message.answer(SUPPORT_PROMPT, reply_markup=build_section_markup(SUPPORT_LABEL, "/support"))


async def prepare_user(message: Message) -> None:
    await delete_temporary_user_message(message)
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )


def build_section_markup(label: str, path: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text=label,
                    web_app=WebAppInfo(url=build_webapp_url(path)),
                )
            ]
        ]
    )


async def delete_temporary_user_message(message: Message) -> None:
    try:
        await message.delete()
    except (TelegramBadRequest, TelegramForbiddenError):
        return
