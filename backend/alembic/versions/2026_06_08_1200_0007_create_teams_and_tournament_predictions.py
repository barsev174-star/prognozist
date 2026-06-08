"""create teams and tournament prediction scaffold

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-08 12:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "0007"
down_revision: str | None = "0006"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    team_confederation = postgresql.ENUM(
        "uefa",
        "conmebol",
        "concacaf",
        "caf",
        "afc",
        "ofc",
        "other",
        name="team_confederation",
        create_type=False,
    )
    team_status = postgresql.ENUM("active", "archived", name="team_status", create_type=False)
    prediction_option_type = postgresql.ENUM(
        "team",
        "player",
        "custom",
        name="tournament_prediction_option_type",
        create_type=False,
    )
    prediction_question_status = postgresql.ENUM(
        "draft",
        "active",
        "locked",
        "resolved",
        "cancelled",
        name="tournament_prediction_question_status",
        create_type=False,
    )

    team_confederation.create(op.get_bind(), checkfirst=True)
    team_status.create(op.get_bind(), checkfirst=True)
    prediction_option_type.create(op.get_bind(), checkfirst=True)
    prediction_question_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("short_name", sa.String(length=128), nullable=True),
        sa.Column("fifa_code", sa.String(length=8), nullable=True),
        sa.Column("flag_emoji", sa.String(length=16), nullable=True),
        sa.Column("logo_url", sa.String(length=1024), nullable=True),
        sa.Column("confederation", team_confederation, server_default="other", nullable=False),
        sa.Column("status", team_status, server_default="active", nullable=False),
        sa.Column("is_national_team", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_placeholder", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("fifa_code", name="uq_teams_fifa_code"),
        sa.UniqueConstraint("slug", name="uq_teams_slug"),
    )

    op.add_column("matches", sa.Column("team_1_id", sa.Integer(), nullable=True))
    op.add_column("matches", sa.Column("team_2_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_matches_team_1_id_teams", "matches", "teams", ["team_1_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_matches_team_2_id_teams", "matches", "teams", ["team_2_id"], ["id"], ondelete="SET NULL")

    op.create_table(
        "tournament_prediction_questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tournament_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=128), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("option_type", prediction_option_type, nullable=False),
        sa.Column("status", prediction_question_status, server_default="draft", nullable=False),
        sa.Column("points", sa.Integer(), server_default="0", nullable=False),
        sa.Column("lock_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tournament_id", "code", name="uq_tournament_prediction_questions_code"),
    )

    op.create_table(
        "tournament_prediction_options",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("team_id", sa.Integer(), nullable=True),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["tournament_prediction_questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", "label", name="uq_tournament_prediction_options_label"),
    )

    op.create_table(
        "tournament_predictions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("selected_option_id", sa.Integer(), nullable=True),
        sa.Column("free_text", sa.Text(), nullable=True),
        sa.Column("points_awarded", sa.Integer(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["question_id"], ["tournament_prediction_questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["selected_option_id"], ["tournament_prediction_options.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", "user_id", name="uq_tournament_predictions_question_user"),
    )

    op.create_table(
        "tournament_prediction_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("correct_option_id", sa.Integer(), nullable=True),
        sa.Column("correct_text", sa.Text(), nullable=True),
        sa.Column("resolved_by_user_id", sa.Integer(), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["correct_option_id"], ["tournament_prediction_options.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["question_id"], ["tournament_prediction_questions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resolved_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id", name="uq_tournament_prediction_results_question"),
    )


def downgrade() -> None:
    op.drop_table("tournament_prediction_results")
    op.drop_table("tournament_predictions")
    op.drop_table("tournament_prediction_options")
    op.drop_table("tournament_prediction_questions")

    op.drop_constraint("fk_matches_team_2_id_teams", "matches", type_="foreignkey")
    op.drop_constraint("fk_matches_team_1_id_teams", "matches", type_="foreignkey")
    op.drop_column("matches", "team_2_id")
    op.drop_column("matches", "team_1_id")

    op.drop_table("teams")

    sa.Enum(name="tournament_prediction_question_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="tournament_prediction_option_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="team_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="team_confederation").drop(op.get_bind(), checkfirst=True)
