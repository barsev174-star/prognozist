from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from config import settings


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    app_button = KeyboardButton(text="Открыть приложение")
    if settings.telegram_webapp_url.startswith("https://"):
        app_button = KeyboardButton(
            text="Открыть приложение",
            web_app=WebAppInfo(url=settings.telegram_webapp_url),
        )

    return ReplyKeyboardMarkup(
        keyboard=[
            [app_button],
            [KeyboardButton(text="Рейтинг"), KeyboardButton(text="Мои лиги")],
            [KeyboardButton(text="VIP"), KeyboardButton(text="Рефералы")],
            [KeyboardButton(text="Правила"), KeyboardButton(text="Поддержка")],
        ],
        resize_keyboard=True,
    )
