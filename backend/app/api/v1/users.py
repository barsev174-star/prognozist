from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models import User
from app.schemas.user import UserProfile

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

