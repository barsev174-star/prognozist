from aiohttp import web
from aiogram import Bot

from config import settings


def create_internal_app(bot: Bot) -> web.Application:
    app = web.Application()
    app["bot"] = bot
    app.router.add_post("/internal/publish/vip", publish_vip)
    return app


async def publish_vip(request: web.Request) -> web.Response:
    token = request.headers.get("X-Bot-Internal-Token")
    if token != settings.bot_internal_token:
        return web.json_response({"detail": "Forbidden"}, status=403)
    if not settings.telegram_vip_channel_id:
        return web.json_response({"detail": "VIP channel is not configured"}, status=409)

    payload = await request.json()
    text = payload.get("text")
    if not isinstance(text, str) or not text.strip():
        return web.json_response({"detail": "Text is required"}, status=422)

    bot: Bot = request.app["bot"]
    message = await bot.send_message(chat_id=settings.telegram_vip_channel_id, text=text)
    return web.json_response({"message_id": message.message_id})

