import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class TournamentPredictionQuestionStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    locked = "locked"
    resolved = "resolved"
    cancelled = "cancelled"


class TournamentPredictionOptionType(str, enum.Enum):
    team = "team"
    player = "player"
    custom = "custom"


class TournamentPredictionQuestion(TimestampMixin, Base):
    __tablename__ = "tournament_prediction_questions"
    __table_args__ = (UniqueConstraint("tournament_id", "code", name="uq_tournament_prediction_questions_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"), nullable=False)
    code: Mapped[str] = mapped_column(String(128), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    option_type: Mapped[TournamentPredictionOptionType] = mapped_column(
        Enum(TournamentPredictionOptionType, name="tournament_prediction_option_type"),
        nullable=False,
    )
    status: Mapped[TournamentPredictionQuestionStatus] = mapped_column(
        Enum(TournamentPredictionQuestionStatus, name="tournament_prediction_question_status"),
        nullable=False,
        default=TournamentPredictionQuestionStatus.draft,
        server_default=TournamentPredictionQuestionStatus.draft.value,
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    lock_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tournament: Mapped["Tournament"] = relationship()
    options: Mapped[list["TournamentPredictionOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
    )
    predictions: Mapped[list["TournamentPrediction"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
    )
    result: Mapped["TournamentPredictionResult | None"] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
    )


class TournamentPredictionOption(TimestampMixin, Base):
    __tablename__ = "tournament_prediction_options"
    __table_args__ = (UniqueConstraint("question_id", "label", name="uq_tournament_prediction_options_label"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("tournament_prediction_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    question: Mapped["TournamentPredictionQuestion"] = relationship(back_populates="options")
    team: Mapped["Team | None"] = relationship()


class TournamentPrediction(TimestampMixin, Base):
    __tablename__ = "tournament_predictions"
    __table_args__ = (UniqueConstraint("question_id", "user_id", name="uq_tournament_predictions_question_user"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("tournament_prediction_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    selected_option_id: Mapped[int | None] = mapped_column(
        ForeignKey("tournament_prediction_options.id", ondelete="SET NULL"),
        nullable=True,
    )
    free_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    points_awarded: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    question: Mapped["TournamentPredictionQuestion"] = relationship(back_populates="predictions")
    selected_option: Mapped["TournamentPredictionOption | None"] = relationship()
    user: Mapped["User"] = relationship()


class TournamentPredictionResult(TimestampMixin, Base):
    __tablename__ = "tournament_prediction_results"
    __table_args__ = (UniqueConstraint("question_id", name="uq_tournament_prediction_results_question"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("tournament_prediction_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    correct_option_id: Mapped[int | None] = mapped_column(
        ForeignKey("tournament_prediction_options.id", ondelete="SET NULL"),
        nullable=True,
    )
    correct_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    question: Mapped["TournamentPredictionQuestion"] = relationship(back_populates="result")
    correct_option: Mapped["TournamentPredictionOption | None"] = relationship()
    resolved_by_user: Mapped["User | None"] = relationship()
