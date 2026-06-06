from aiogram import Router
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from config import settings
from keyboards.main_menu import main_menu_keyboard
from services.api_client import upsert_bot_user

router = Router()


@router.message(CommandStart())
async def handle_start(message: Message) -> None:
    await delete_temporary_user_message(message)
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    await message.answer(
        "Выберите раздел:",
        reply_markup=main_menu_keyboard(),
    )
    await message.answer(
        "Открыть Mini App:",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="Открыть приложение",
                        web_app=WebAppInfo(url=settings.telegram_webapp_url),
                    )
                ]
            ]
        ),
    )


async def delete_temporary_user_message(message: Message) -> None:
    try:
        await message.delete()
    except (TelegramBadRequest, TelegramForbiddenError):
        return
