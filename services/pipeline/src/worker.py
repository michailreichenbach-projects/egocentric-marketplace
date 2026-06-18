"""
Celery worker — entry point.
Run with: celery -A src.worker worker --loglevel=info
"""
from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "pipeline",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["src.tasks.process_clip"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
