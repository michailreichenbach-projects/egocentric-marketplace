"""
Face blurring using OpenCV's built-in Haar cascade detector.
Good enough for dev/testing. Swap for a deep learning model in production.
"""
import cv2
import logging
import shutil

logger = logging.getLogger(__name__)

CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


def blur_faces(input_path: str, output_path: str, blur_strength: int = 51):
    """
    Read input_path, blur all detected faces, write to output_path.
    """
    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
    if face_cascade.empty():
        logger.warning("Could not load face cascade — copying video without blur")
        shutil.copy(input_path, output_path)
        return

    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    boxes = []
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Re-detect every 5 frames for performance
        if frame_count % 5 == 0:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
            )
            boxes = faces if len(faces) > 0 else []

        for (x, y, w, h) in boxes:
            roi = frame[y:y+h, x:x+w]
            blurred = cv2.GaussianBlur(roi, (blur_strength, blur_strength), 0)
            frame[y:y+h, x:x+w] = blurred

        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()
    logger.info(f"Processed {frame_count} frames")
