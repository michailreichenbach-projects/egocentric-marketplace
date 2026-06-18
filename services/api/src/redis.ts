const PIPELINE_URL = process.env.PIPELINE_URL || "http://localhost:8000";

/**
 * Trigger the pipeline by calling the FastAPI HTTP endpoint.
 * Cleaner than trying to replicate Celery's Redis message format from TypeScript.
 */
export async function enqueuePipelineJob(clipId: string, s3Key: string) {
  const res = await fetch(`${PIPELINE_URL}/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clip_id: clipId, s3_key: s3Key }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pipeline trigger failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  console.log(`Pipeline job queued: ${data.task_id} for clip ${clipId}`);
  return data.task_id;
}
