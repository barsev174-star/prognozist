from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.core.telegram_auth import validate_telegram_init_data
from app.db.session import get_db
from app.models import User
from app.schemas.auth import AuthResponse, BotUserUpsertRequest, DevAuthRequest, TelegramAuthRequest
from app.schemas.user import UserProfile
from app.services.referrals import parse_referrer_telegram_id, register_referral

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/telegram", response_model=AuthResponse)
def authenticate_telegram(payload: TelegramAuthRequest, db: Session = Depends(get_db)) -> AuthResponse:
    telegram_user = validate_telegram_init_data(payload.init_data)

    user = db.scalar(select(User).where(User.telegram_id == telegram_user.telegram_id))
    if user is None:
        user = User(
            telegram_id=telegram_user.telegram_id,
            username=telegram_user.username,
            first_name=telegram_user.first_name,
        )
        db.add(user)
        db.flush()
        register_referral(db, parse_referrer_telegram_id(telegram_user.start_param), user)
        db.commit()
        db.refresh(user)
    else:
        if user.is_blocked:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is blocked")
        user.username = telegram_user.username
        user.first_name = telegram_user.first_name
        db.commit()
        db.refresh(user)

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
