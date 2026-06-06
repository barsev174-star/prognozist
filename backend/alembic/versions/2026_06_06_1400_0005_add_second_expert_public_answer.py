"""add second expert public answer

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-06 14:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("expert_predictions", sa.Column("question_2_answer", sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column("expert_predictions", "question_2_answer")
