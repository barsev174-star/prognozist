from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Prediction(TimestampMixin, Base):
    __tablename__ = "predictions"
    __table_args__ = (
        UniqueConstraint("user_id", "match_id", name="uq_predictions_user_match"),
        CheckConstraint("predicted_team_1_score >= 0", name="ck_predictions_team_1_score_non_negative"),
        CheckConstraint("predicted_team_2_score >= 0", name="ck_predictions_team_2_score_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    predicted_team_1_score: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_team_2_score: Mapped[int] = mapped_column(Integer, nullable=False)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    is_exact_score: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    is_outcome_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    match: Mapped["Match"] = relationship(back_populates="predictions")
    user: Mapped["User"] = relationship()

