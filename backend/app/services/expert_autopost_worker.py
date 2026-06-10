import asyncio
import logging

from app.db.session import SessionLocal
from app.models import SystemLog
from app.services.autoposting_clean import DueExpertPostPublishResult, publish_due_expert_predictions_async

logger = logging.getLogger(__name__)


async def process_due_expert_predictions_job() -> DueExpertPostPublishResult:
    db = SessionLocal()
    try:
        result = await publish_due_expert_predictions_async(db)
        if result.published or result.failed:
            db.add(
                SystemLog(
                    event_type="expert_predictions_due_processed",
                    payload_json={
                        "checked": result.checked,
                        "published": result.published,
                        "failed": result.failed,
                        "published_items": result.published_items,
                        "failed_items": result.failed_items,
                    },
                )
            )
        if result.failed:
            db.add(
                SystemLog(
                    event_type="vip_channel_publish_failed",
                    payload_json={
                        "context": "expert_prediction_due_publish",
                        "checked": result.checked,
                        "published": result.published,
                        "failed": result.failed,
                        "failed_items": result.failed_items,
                    },
                )
            )
        db.commit()
        return result
    except Exception:
        db.rollback()
        logger.exception("Expert autopost job failed")
        raise
    finally:
        db.close()


async def expert_autopost_loop(interval_seconds: int, stop_event: asyncio.Event) -> None:
    while not stop_event.is_set():
        try:
            result = await process_due_expert_predictions_job()
            if result.published or result.failed:
                logger.info(
                    "Expert autopost cycle finished: checked=%s published=%s failed=%s",
                    result.checked,
                    result.published,
                    result.failed,
                )
        except Exception:
            logger.exception("Expert autopost loop iteration failed")

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            continue
