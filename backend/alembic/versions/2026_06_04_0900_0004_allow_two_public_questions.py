"""allow two public questions per match

Revision ID: 0004
Revises: 0003
Create Date: 2026-06-04 09:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("questions", sa.Column("slot", sa.Integer(), server_default="1", nullable=False))
    op.drop_constraint("uq_questions_match", "questions", type_="unique")
    op.create_check_constraint("ck_questions_slot_range", "questions", "slot IN (1, 2)")
    op.create_unique_constraint("uq_questions_match_slot", "questions", ["match_id", "slot"])


def downgrade() -> None:
    op.drop_constraint("uq_questions_match_slot", "questions", type_="unique")
    op.drop_constraint("ck_questions_slot_range", "questions", type_="check")
    op.create_unique_constraint("uq_questions_match", "questions", ["match_id"])
    op.drop_column("questions", "slot")
