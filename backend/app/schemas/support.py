from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


SupportCategory = Literal["bug", "idea", "question", "payment"]


class SupportRequestCreate(BaseModel):
    category: SupportCategory
    message: str = Field(min_length=10, max_length=2000)


class SupportRequestRead(BaseModel):
    status: str
    category: SupportCategory
    created_at: datetime
