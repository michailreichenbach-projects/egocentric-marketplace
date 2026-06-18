"""Extract video metadata using OpenCV."""
import cv2
import os
import logging

logger = logging.getLogger(__name__)

def extract_metadata(video_path: str) -> dict:
    """Return basic metadata for a video file."""
    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration_seconds = frame_count / fps if fps > 0 else 0

    cap.release()

    meta = {
        "fps": fps,
        "frame_count": int(frame_count),
        "width": width,
        "height": height,
        "duration_seconds": round(duration_seconds, 2),
        "file_size_bytes": os.path.getsize(video_path),
    }

    logger.info(f"Metadata: {meta}")
    return meta
