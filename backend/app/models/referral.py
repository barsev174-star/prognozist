import enum
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ReferralStatus(str, enum.Enum):
    registered = "registered"
    activated = "activated"


class Referral(Base):
    __tablename__ = "referrals"
    __table_args__ = (
        UniqueConstraint("referred_id", name="uq_referrals_referred_id"),
        CheckConstraint("referrer_id <> referred_id", name="ck_referrals_not_self"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    referrer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    referred_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[ReferralStatus] = mapped_column(
        Enum(ReferralStatus, name="referral_status"),
        nullable=False,
        default=ReferralStatus.registered,
        server_default=ReferralStatus.registered.value,
    )
    activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    referrer: Mapped["User"] = relationship(foreign_keys=[referrer_id])
    referred: Mapped["User"] = relationship(foreign_keys=[referred_id])
