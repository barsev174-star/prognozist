from fastapi import APIRouter

from app.api.v1 import achievements, admin, auth, leagues, matches, payments, predictions, questions, rankings, referrals, users, vip

router = APIRouter()


@router.get("/health", tags=["System"])
async def api_health() -> dict[str, str]:
    return {"status": "ok"}


api_router = router
api_router.include_router(achievements.router)
api_router.include_router(admin.router)
api_router.include_router(auth.router)
api_router.include_router(leagues.router)
api_router.include_router(matches.router)
api_router.include_router(payments.router)
api_router.include_router(predictions.router)
api_router.include_router(questions.router)
api_router.include_router(rankings.router)
api_router.include_router(referrals.router)
api_router.include_router(users.router)
api_router.include_router(vip.router)
