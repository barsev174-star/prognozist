"""add expert post publication state

Revision ID: 0008
Revises: 0007
Create Date: 2026-06-10 12:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0008"
down_revision: str | None = "0007"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


expert_post_publish_source = sa.Enum("manual", "automatic", name="expert_post_publish_source")


def upgrade() -> None:
    bind = op.get_bind()
    expert_post_publish_source.create(bind, checkfirst=True)

    op.add_column(
        "expert_predictions",
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "expert_predictions",
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "expert_predictions",
        sa.Column("publish_source", expert_post_publish_source, nullable=True),
    )
    op.add_column(
        "expert_predictions",
        sa.Column("result_post_published_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("expert_predictions", "result_post_published_at")
    op.drop_column("expert_predictions", "publish_source")
    op.drop_column("expert_predictions", "published_at")
    op.drop_column("expert_predictions", "is_published")

    bind = op.get_bind()
    expert_post_publish_source.drop(bind, checkfirst=True)