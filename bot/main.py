import asyncio
import logging

from aiohttp import web
from aiogram import Bot, Dispatcher

from config import settings
from handlers import router
from internal_api import create_internal_app


async def main() -> None:
    logging.basicConfig(level=logging.INFO)

    if settings.bot_token == "change-me":
        logging.warning("BOT_TOKEN is not configured; bot polling is skipped.")
        return

    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(router)

    internal_runner = web.AppRunner(create_internal_app(bot))
    await internal_runner.setup()
    site = web.TCPSite(internal_runner, "0.0.0.0", 8080)
    await site.start()

    try:
        await dispatcher.start_polling(bot)
    finally:
        await internal_runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
