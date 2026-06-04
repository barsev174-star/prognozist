from pydantic import BaseModel


class ReferralStats(BaseModel):
    referral_link: str
    registered_count: int
    activated_count: int
    referral_points: int
    next_reward_at: int | None
    next_reward_points: int | None

