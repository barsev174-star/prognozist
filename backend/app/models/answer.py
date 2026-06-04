from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class QuestionAnswer(TimestampMixin, Base):
    __tablename__ = "question_answers"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_question_answers_user_question"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    answer: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    question: Mapped["Question"] = relationship(back_populates="answers")
    user: Mapped["User"] = relationship()


class VipQuestionAnswer(TimestampMixin, Base):
    __tablename__ = "vip_question_answers"
    __table_args__ = (
        UniqueConstraint("user_id", "vip_question_id", name="uq_vip_question_answers_user_question"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vip_question_id: Mapped[int] = mapped_column(ForeignKey("vip_questions.id", ondelete="CASCADE"), nullable=False)
    answer: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    points_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    vip_question: Mapped["VipQuestion"] = relationship(back_populates="answers")
    user: Mapped["User"] = relationship()

