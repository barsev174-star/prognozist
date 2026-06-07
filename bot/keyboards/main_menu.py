from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo

from config import settings

OPEN_APP_LABEL = "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435"
RANKING_LABEL = "\u0420\u0435\u0439\u0442\u0438\u043d\u0433"
LEAGUES_LABEL = "\u041c\u043e\u0438 \u043b\u0438\u0433\u0438"
DONATION_LABEL = "\u0414\u043e\u043d\u0430\u0442"
REFERRALS_LABEL = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044b"
SUPPORT_LABEL = "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430"


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    app_button = KeyboardButton(text=OPEN_APP_LABEL)
    if settings.telegram_webapp_url.startswith("https://"):
        app_button = KeyboardButton(
            text=OPEN_APP_LABEL,
            web_app=WebAppInfo(url=settings.telegram_webapp_url),
        )

    return ReplyKeyboardMarkup(
        keyboard=[
            [app_button],
            [KeyboardButton(text=RANKING_LABEL), KeyboardButton(text=LEAGUES_LABEL)],
            [KeyboardButton(text="VIP"), KeyboardButton(text=DONATION_LABEL)],
            [KeyboardButton(text=REFERRALS_LABEL), KeyboardButton(text=SUPPORT_LABEL)],
        ],
        resize_keyboard=True,
    )
