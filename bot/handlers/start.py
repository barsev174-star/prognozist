from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from keyboards.main_menu import main_menu_keyboard
from services.api_client import upsert_bot_user

router = Router()


@router.message(CommandStart())
async def handle_start(message: Message) -> None:
    await upsert_bot_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    await message.answer(
        "Выберите раздел:",
        reply_markup=main_menu_keyboard(),
    )
