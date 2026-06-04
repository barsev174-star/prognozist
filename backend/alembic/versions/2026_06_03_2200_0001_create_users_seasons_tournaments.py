"""create users seasons tournaments

Revision ID: 0001
Revises: None
Create Date: 2026-06-03 22:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    season_status = postgresql.ENUM("upcoming", "active", "completed", name="season_status", create_type=False)
    tournament_status = postgresql.ENUM("upcoming", "active", "completed", name="tournament_status", create_type=False)
    season_status.create(op.get_bind(), checkfirst=True)
    tournament_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("telegram_id", sa.BigInteger(), nullable=False),
        sa.Column("username", sa.String(length=255), nullable=True),
        sa.Column("first_name", sa.String(length=255), nullable=True),
        sa.Column("points_total", sa.Integer(), server_default="0", nullable=False),
        sa.Column("premium_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_blocked", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("telegram_id"),
    )
    op.create_index("ix_users_premium_until", "users", ["premium_until"])
    op.create_index("ix_users_telegram_id", "users", ["telegram_id"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "seasons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", season_status, server_default="upcoming", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("start_date <= end_date", name="ck_seasons_date_range"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "tournaments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("season_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("status", tournament_status, server_default="upcoming", nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("start_date <= end_date", name="ck_tournaments_date_range"),
        sa.ForeignKeyConstraint(["season_id"], ["seasons.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tournaments_season_id", "tournaments", ["season_id"])
    op.create_index("ix_tournaments_status", "tournaments", ["status"])


def downgrade() -> None:
    op.drop_index("ix_tournaments_status", table_name="tournaments")
    op.drop_index("ix_tournaments_season_id", table_name="tournaments")
    op.drop_table("tournaments")

    op.drop_table("seasons")

    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_telegram_id", table_name="users")
    op.drop_index("ix_users_premium_until", table_name="users")
    op.drop_table("users")

    sa.Enum(name="tournament_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="season_status").drop(op.get_bind(), checkfirst=True)
