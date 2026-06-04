from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from config import settings


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🎯 Открыть приложение", web_app=WebAppInfo(url=settings.telegram_webapp_url))],
            [KeyboardButton(text="🏆 Рейтинг"), KeyboardButton(text="👥 Мои лиги")],
            [KeyboardButton(text="💎 VIP"), KeyboardButton(text="🎁 Рефералы")],
            [KeyboardButton(text="📖 Правила"), KeyboardButton(text="🆘 Поддержка")],
        ],
        resize_keyboard=True,
    )

