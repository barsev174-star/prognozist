import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.services.expert_autopost_worker import expert_autopost_loop


def create_app() -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        stop_event = asyncio.Event()
        worker_task: asyncio.Task | None = None
        if settings.expert_autopost_enabled:
            worker_task = asyncio.create_task(
                expert_autopost_loop(settings.expert_autopost_interval_seconds, stop_event)
            )
            app.state.expert_autopost_task = worker_task

        try:
            yield
        finally:
            stop_event.set()
            if worker_task is not None:
                await worker_task

    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["System"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()

