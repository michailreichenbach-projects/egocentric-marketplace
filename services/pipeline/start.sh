#!/bin/bash
set -e
# Start FastAPI trigger API in background, log to stdout
uvicorn src.main:app --host 0.0.0.0 --port 8000 2>&1 &
UVICORN_PID=$!
echo "uvicorn started with PID $UVICORN_PID"

# Start Celery in foreground
celery -A src.worker worker --loglevel=info --concurrency=2
