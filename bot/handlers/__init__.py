from aiogram import Router

from handlers.start import router as start_router
from handlers.vip import router as vip_router

router = Router()
router.include_router(start_router)
router.include_router(vip_router)
