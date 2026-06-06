from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class ExpertPrediction(TimestampMixin, Base):
    __tablename__ = "expert_predictions"
    __table_args__ = (
        UniqueConstraint("match_id", name="uq_expert_predictions_match"),
        CheckConstraint("predicted_team_1_score >= 0", name="ck_expert_predictions_team_1_score_non_negative"),
        CheckConstraint("predicted_team_2_score >= 0", name="ck_expert_predictions_team_2_score_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    expert_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    predicted_team_1_score: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_team_2_score: Mapped[int] = mapped_column(Integer, nullable=False)
    question_answer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    question_2_answer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    vip_question_answer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    match: Mapped["Match"] = relationship()
    expert_user: Mapped["User | None"] = relationship()

