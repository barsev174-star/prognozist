from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Question(TimestampMixin, Base):
    __tablename__ = "questions"
    __table_args__ = (
        UniqueConstraint("match_id", "slot", name="uq_questions_match_slot"),
        CheckConstraint("points > 0", name="ck_questions_points_positive"),
        CheckConstraint("slot IN (1, 2)", name="ck_questions_slot_range"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    slot: Mapped[int] = mapped_column(Integer, nullable=False, default=1, server_default="1")
    text: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")

    match: Mapped["Match"] = relationship(back_populates="questions")
    answers: Mapped[list["QuestionAnswer"]] = relationship(back_populates="question", cascade="all, delete-orphan")


class VipQuestion(TimestampMixin, Base):
    __tablename__ = "vip_questions"
    __table_args__ = (
        UniqueConstraint("match_id", name="uq_vip_questions_match"),
        CheckConstraint("points > 0", name="ck_vip_questions_points_positive"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")

    match: Mapped["Match"] = relationship(back_populates="vip_question")
    answers: Mapped[list["VipQuestionAnswer"]] = relationship(
        back_populates="vip_question",
        cascade="all, delete-orphan",
    )
