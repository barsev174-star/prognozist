"""create matches predictions questions

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-03 22:10:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    match_status = postgresql.ENUM("upcoming", "live", "calculating", "completed", name="match_status", create_type=False)
    match_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tournament_id", sa.Integer(), nullable=False),
        sa.Column("team_1", sa.String(length=255), nullable=False),
        sa.Column("team_2", sa.String(length=255), nullable=False),
        sa.Column("team_1_logo", sa.String(length=1024), nullable=True),
        sa.Column("team_2_logo", sa.String(length=1024), nullable=True),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", match_status, server_default="upcoming", nullable=False),
        sa.Column("team_1_score", sa.Integer(), nullable=True),
        sa.Column("team_2_score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("team_1_score IS NULL OR team_1_score >= 0", name="ck_matches_team_1_score_non_negative"),
        sa.CheckConstraint("team_2_score IS NULL OR team_2_score >= 0", name="ck_matches_team_2_score_non_negative"),
        sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_matches_start_time", "matches", ["start_time"])
    op.create_index("ix_matches_status", "matches", ["status"])
    op.create_index("ix_matches_tournament_id", "matches", ["tournament_id"])

    op.create_table(
        "predictions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("predicted_team_1_score", sa.Integer(), nullable=False),
        sa.Column("predicted_team_2_score", sa.Integer(), nullable=False),
        sa.Column("points_awarded", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_exact_score", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("is_outcome_correct", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("predicted_team_1_score >= 0", name="ck_predictions_team_1_score_non_negative"),
        sa.CheckConstraint("predicted_team_2_score >= 0", name="ck_predictions_team_2_score_non_negative"),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "match_id", name="uq_predictions_user_match"),
    )

    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("correct_answer", sa.Boolean(), nullable=True),
        sa.Column("points", sa.Integer(), server_default="3", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("points > 0", name="ck_questions_points_positive"),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("match_id", name="uq_questions_match"),
    )

    op.create_table(
        "vip_questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("correct_answer", sa.Boolean(), nullable=True),
        sa.Column("points", sa.Integer(), server_default="3", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("points > 0", name="ck_vip_questions_points_positive"),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("match_id", name="uq_vip_questions_match"),
    )

    op.create_table(
        "question_answers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("answer", sa.Boolean(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("points_awarded", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "question_id", name="uq_question_answers_user_question"),
    )

    op.create_table(
        "vip_question_answers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vip_question_id", sa.Integer(), nullable=False),
        sa.Column("answer", sa.Boolean(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=True),
        sa.Column("points_awarded", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vip_question_id"], ["vip_questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "vip_question_id", name="uq_vip_question_answers_user_question"),
    )


def downgrade() -> None:
    op.drop_table("vip_question_answers")
    op.drop_table("question_answers")
    op.drop_table("vip_questions")
    op.drop_table("questions")
    op.drop_table("predictions")

    op.drop_index("ix_matches_tournament_id", table_name="matches")
    op.drop_index("ix_matches_status", table_name="matches")
    op.drop_index("ix_matches_start_time", table_name="matches")
    op.drop_table("matches")

    sa.Enum(name="match_status").drop(op.get_bind(), checkfirst=True)
