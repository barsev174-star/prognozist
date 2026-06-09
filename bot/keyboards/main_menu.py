from aiogram.types import KeyboardButton, ReplyKeyboardMarkup

from config import settings

RANKING_LABEL = "\u0420\u0435\u0439\u0442\u0438\u043d\u0433"
LEAGUES_LABEL = "\u041c\u043e\u0438 \u043b\u0438\u0433\u0438"
DONATION_LABEL = "\u0414\u043e\u043d\u0430\u0442"
REFERRALS_LABEL = "\u0420\u0435\u0444\u0435\u0440\u0430\u043b\u044b"
SUPPORT_LABEL = "\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430"


def build_webapp_url(path: str = "/") -> str:
    base_url = settings.telegram_webapp_url.rstrip("/")
    normalized_path = path if path.startswith("/") else f"/{path}"
    if normalized_path == "/":
        return base_url
    return f"{base_url}{normalized_path}"


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=RANKING_LABEL), KeyboardButton(text=LEAGUES_LABEL)],
            [KeyboardButton(text="VIP"), KeyboardButton(text=DONATION_LABEL)],
            [KeyboardButton(text=REFERRALS_LABEL), KeyboardButton(text=SUPPORT_LABEL)],
        ],
        resize_keyboard=True,
    )
