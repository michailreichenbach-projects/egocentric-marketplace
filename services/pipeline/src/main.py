"""
Minimal FastAPI HTTP trigger for the pipeline.
The TypeScript API calls POST /trigger instead of pushing directly to Redis.
Celery then handles the actual task execution.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.worker import celery_app

app = FastAPI(title="Pipeline Trigger API")

class TriggerRequest(BaseModel):
    clip_id: str
    s3_key: str

@app.post("/trigger")
def trigger_processing(req: TriggerRequest):
    task = celery_app.send_task(
        "src.tasks.process_clip.process_clip",
        args=[req.clip_id, req.s3_key],
    )
    return {"task_id": task.id, "clip_id": req.clip_id, "status": "queued"}

@app.get("/health")
def health():
    return {"status": "ok"}
