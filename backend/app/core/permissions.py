from fastapi import Depends, HTTPException, status

from app.core.config import settings
from app.core.security import get_current_user
from app.models import User


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.telegram_id not in settings.admin_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

