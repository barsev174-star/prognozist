from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import SystemLog, User
from app.schemas.support import SupportRequestCreate, SupportRequestRead
from app.services.telegram_bot_api import notify_admins

router = APIRouter(prefix="/support", tags=["Support"])


@router.post("/requests", response_model=SupportRequestRead)
def create_support_request(
    payload: SupportRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportRequestRead:
    created_at = datetime.now(UTC)
    db.add(
        SystemLog(
            event_type="user_support_message",
            user_id=current_user.id,
            payload_json={
                "category": payload.category,
                "message": payload.message.strip(),
                "source": "mini_app",
            },
            created_at=created_at,
        )
    )
    db.commit()

    notify_admins(
        "\n".join(
            [
                "Новое сообщение в поддержку",
                f"Категория: {payload.category}",
                f"Пользователь: {current_user.first_name or current_user.username or current_user.telegram_id}",
                "",
                payload.message.strip(),
            ]
        )
    )

    return SupportRequestRead(
        status="received",
        category=payload.category,
        created_at=created_at,
    )
