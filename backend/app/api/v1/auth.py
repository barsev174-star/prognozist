from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.core.telegram_auth import TelegramUserData, validate_telegram_init_data, validate_telegram_login_widget_data
from app.db.session import get_db
from app.models import User
from app.schemas.auth import AuthResponse, BotUserUpsertRequest, DevAuthRequest, TelegramAuthRequest, TelegramBrowserAuthRequest
from app.schemas.user import UserProfile
from app.services.referrals import parse_referrer_telegram_id, register_referral

router = APIRouter(prefix="/auth", tags=["Auth"])


def upsert_user_from_telegram(
    telegram_user: TelegramUserData,
    db: Session,
    *,
    allow_referrals: bool,
) -> User:
    user = db.scalar(select(User).where(User.telegram_id == telegram_user.telegram_id))
    if user is None:
        user = User(
            telegram_id=telegram_user.telegram_id,
            username=telegram_user.username,
            first_name=telegram_user.first_name,
        )
        db.add(user)
        db.flush()
        if allow_referrals:
            register_referral(db, parse_referrer_telegram_id(telegram_user.start_param), user)
        db.commit()
        db.refresh(user)
        return user

    if user.is_blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is blocked")

    user.username = telegram_user.username
    user.first_name = telegram_user.first_name
    db.commit()
    db.refresh(user)
    return user


@router.post("/telegram", response_model=AuthResponse)
def authenticate_telegram(payload: TelegramAuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    telegram_user = validate_telegram_init_data(payload.init_data)
    user = upsert_user_from_telegram(telegram_user, db, allow_referrals=True)

    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=user)


@router.post("/telegram-browser-admin", response_model=AuthResponse)
def authenticate_telegram_browser_admin(payload: TelegramBrowserAuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    telegram_user = validate_telegram_login_widget_data(payload.model_dump())
    if telegram_user.telegram_id not in settings.admin_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    user = upsert_user_from_telegram(telegram_user, db, allow_referrals=False)
    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=user)


@router.post("/bot-user", response_model=UserProfile)
def upsert_bot_user(
    payload: BotUserUpsertRequest,
    x_bot_internal_token: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if x_bot_internal_token != settings.bot_internal_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bot token")

    user = db.scalar(select(User).where(User.telegram_id == payload.telegram_id))
    if user is None:
        user = User(
            telegram_id=payload.telegram_id,
            username=payload.username,
            first_name=payload.first_name,
        )
        db.add(user)
    else:
        user.username = payload.username
        user.first_name = payload.first_name

    db.commit()
    db.refresh(user)
    return user


@router.post("/dev", response_model=AuthResponse)
def authenticate_dev(payload: DevAuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    if settings.environment != "local":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    user = db.scalar(select(User).where(User.telegram_id == payload.telegram_id))
    if user is None:
        user = User(
            telegram_id=payload.telegram_id,
            username=payload.username,
            first_name=payload.first_name,
        )
        db.add(user)
    else:
        user.username = payload.username
        user.first_name = payload.first_name

    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id))
    return AuthResponse(access_token=token, user=user)
