"""create mvp support tables

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-03 22:20:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    league_status = postgresql.ENUM("active", "completed", "archived", name="league_status", create_type=False)
    vip_status = postgresql.ENUM("active", "expired", "cancelled", name="vip_subscription_status", create_type=False)
    referral_status = postgresql.ENUM("registered", "activated", name="referral_status", create_type=False)
    league_status.create(op.get_bind(), checkfirst=True)
    vip_status.create(op.get_bind(), checkfirst=True)
    referral_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "leagues",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("tournament_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("prize_description", sa.Text(), nullable=True),
        sa.Column("invite_code", sa.String(length=64), nullable=False),
        sa.Column("status", league_status, server_default="active", nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("invite_code", name="uq_leagues_invite_code"),
    )
    op.create_index("ix_leagues_owner_id", "leagues", ["owner_id"])
    op.create_index("ix_leagues_tournament_id", "leagues", ["tournament_id"])

    op.create_table(
        "league_members",
        sa.Column("league_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["league_id"], ["leagues.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("league_id", "user_id"),
    )

    op.create_table(
        "tournament_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tournament_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("final_rank", sa.Integer(), nullable=False),
        sa.Column("final_points", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("tournament_id", "final_rank", name="uq_tournament_results_tournament_rank"),
        sa.UniqueConstraint("tournament_id", "user_id", name="uq_tournament_results_tournament_user"),
    )

    op.create_table(
        "league_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("league_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("final_rank", sa.Integer(), nullable=False),
        sa.Column("final_points", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["league_id"], ["leagues.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("league_id", "final_rank", name="uq_league_results_league_rank"),
        sa.UniqueConstraint("league_id", "user_id", name="uq_league_results_league_user"),
    )

    op.create_table(
        "expert_predictions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("match_id", sa.Integer(), nullable=False),
        sa.Column("expert_user_id", sa.Integer(), nullable=True),
        sa.Column("predicted_team_1_score", sa.Integer(), nullable=False),
        sa.Column("predicted_team_2_score", sa.Integer(), nullable=False),
        sa.Column("question_answer", sa.Boolean(), nullable=True),
        sa.Column("vip_question_answer", sa.Boolean(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("predicted_team_1_score >= 0", name="ck_expert_predictions_team_1_score_non_negative"),
        sa.CheckConstraint("predicted_team_2_score >= 0", name="ck_expert_predictions_team_2_score_non_negative"),
        sa.ForeignKeyConstraint(["expert_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("match_id", name="uq_expert_predictions_match"),
    )

    op.create_table(
        "vip_subscriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("telegram_payment_charge_id", sa.String(length=255), nullable=False),
        sa.Column("stars_amount", sa.Integer(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", vip_status, server_default="active", nullable=False),
        sa.Column("invite_link", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("telegram_payment_charge_id", name="uq_vip_subscriptions_charge_id"),
    )

    op.create_table(
        "referrals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("referrer_id", sa.Integer(), nullable=False),
        sa.Column("referred_id", sa.Integer(), nullable=False),
        sa.Column("status", referral_status, server_default="registered", nullable=False),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("referrer_id <> referred_id", name="ck_referrals_not_self"),
        sa.ForeignKeyConstraint(["referred_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["referrer_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("referred_id", name="uq_referrals_referred_id"),
    )

    op.create_table(
        "achievements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("share_template", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_achievements_code"),
    )

    op.create_table(
        "user_achievements",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("achievement_id", sa.Integer(), nullable=False),
        sa.Column("earned_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("share_card_url", sa.String(length=1024), nullable=True),
        sa.ForeignKeyConstraint(["achievement_id"], ["achievements.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", "achievement_id"),
    )

    op.create_table(
        "system_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=128), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("payload_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_system_logs_created_at", "system_logs", ["created_at"])
    op.create_index("ix_system_logs_event_type", "system_logs", ["event_type"])
    op.create_index("ix_system_logs_payload_json", "system_logs", ["payload_json"], postgresql_using="gin")
    op.create_index("ix_system_logs_user_id", "system_logs", ["user_id"])

    op.create_table(
        "points_log",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(length=64), nullable=False),
        sa.Column("source_id", sa.Integer(), nullable=False),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "source_type", "source_id", name="uq_points_log_user_source"),
    )
    op.create_index("ix_points_log_created_at", "points_log", ["created_at"])
    op.create_index("ix_points_log_source", "points_log", ["source_type", "source_id"])
    op.create_index("ix_points_log_user_id", "points_log", ["user_id"])

    op.bulk_insert(
        sa.table(
            "achievements",
            sa.column("code", sa.String),
            sa.column("name", sa.String),
            sa.column("description", sa.Text),
            sa.column("share_template", sa.Text),
        ),
        [
            {
                "code": "first_prediction",
                "name": "Первый прогноз",
                "description": "Пользователь сделал первый прогноз.",
                "share_template": "Я сделал первый прогноз в турнире прогнозистов!",
            },
            {
                "code": "first_exact_score",
                "name": "Первый точный счет",
                "description": "Пользователь впервые угадал точный счет.",
                "share_template": "Я впервые угадал точный счет!",
            },
            {
                "code": "ten_exact_scores",
                "name": "10 точных счетов",
                "description": "Пользователь угадал 10 точных счетов.",
                "share_template": "У меня уже 10 точных счетов!",
            },
            {
                "code": "hundred_points",
                "name": "100 очков",
                "description": "Пользователь набрал 100 очков.",
                "share_template": "Я набрал 100 очков!",
            },
            {
                "code": "tournament_top_10",
                "name": "Топ-10 турнира",
                "description": "Пользователь попал в топ-10 турнира.",
                "share_template": "Я в топ-10 турнира прогнозистов!",
            },
            {
                "code": "tournament_champion",
                "name": "Чемпион турнира",
                "description": "Пользователь стал чемпионом турнира.",
                "share_template": "Я стал чемпионом турнира прогнозистов!",
            },
            {
                "code": "fifty_invited_friends",
                "name": "50 приглашенных друзей",
                "description": "Пользователь пригласил 50 активированных друзей.",
                "share_template": "Я пригласил 50 друзей!",
            },
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_points_log_user_id", table_name="points_log")
    op.drop_index("ix_points_log_source", table_name="points_log")
    op.drop_index("ix_points_log_created_at", table_name="points_log")
    op.drop_table("points_log")

    op.drop_index("ix_system_logs_user_id", table_name="system_logs")
    op.drop_index("ix_system_logs_payload_json", table_name="system_logs")
    op.drop_index("ix_system_logs_event_type", table_name="system_logs")
    op.drop_index("ix_system_logs_created_at", table_name="system_logs")
    op.drop_table("system_logs")

    op.drop_table("user_achievements")
    op.drop_table("achievements")
    op.drop_table("referrals")
    op.drop_table("vip_subscriptions")
    op.drop_table("expert_predictions")
    op.drop_table("league_results")
    op.drop_table("tournament_results")
    op.drop_table("league_members")

    op.drop_index("ix_leagues_tournament_id", table_name="leagues")
    op.drop_index("ix_leagues_owner_id", table_name="leagues")
    op.drop_table("leagues")

    sa.Enum(name="referral_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="vip_subscription_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="league_status").drop(op.get_bind(), checkfirst=True)
