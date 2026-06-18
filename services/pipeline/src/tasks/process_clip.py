"""
Main processing task: download → blur faces → extract metadata → upload → update DB.
"""
import os
import tempfile
import logging
from src.worker import celery_app
from src.db import update_clip_status
from src.s3 import download_clip, upload_clip
from src.tasks.blur import blur_faces
from src.tasks.metadata import extract_metadata

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_clip(self, clip_id: str, s3_key: str):
    """
    Full processing pipeline for one video clip.
    Called after /upload/complete marks the clip as 'uploaded'.
    """
    logger.info(f"Processing clip {clip_id} from {s3_key}")

    # Mark as processing
    update_clip_status(clip_id, "processing")

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            raw_path = os.path.join(tmpdir, "raw.mp4")
            blurred_path = os.path.join(tmpdir, "blurred.mp4")

            # 1. Download raw video from S3
            logger.info(f"Downloading {s3_key}")
            download_clip(s3_key, raw_path)

            # 2. Blur faces (GDPR compliance)
            logger.info("Running face blur")
            blur_faces(raw_path, blurred_path)

            # 3. Extract metadata
            logger.info("Extracting metadata")
            meta = extract_metadata(blurred_path)

            # 4. Upload processed video to processed bucket
            processed_key = s3_key.replace("raw/", "processed/")
            logger.info(f"Uploading processed video to {processed_key}")
            upload_clip(blurred_path, processed_key)

        # 5. Update DB — mark as ready for marketplace
        update_clip_status(
            clip_id,
            "ready",
            duration_seconds=meta.get("duration_seconds"),
            processed_s3_key=processed_key,
        )
        logger.info(f"Clip {clip_id} ready")

    except Exception as exc:
        logger.error(f"Failed to process clip {clip_id}: {exc}")
        update_clip_status(clip_id, "failed")
        raise self.retry(exc=exc)
