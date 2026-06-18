import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redis.on("error", (err) => console.error("Redis error:", err));

export async function connectRedis() {
  if (!redis.isOpen) await redis.connect();
}

/**
 * Enqueue a Celery-compatible task onto the default queue.
 * Celery expects a specific JSON envelope format.
 */
export async function enqueuePipelineJob(clipId: string, s3Key: string) {
  await connectRedis();

  const taskId = crypto.randomUUID();
  const message = JSON.stringify({
    id: taskId,
    task: "src.tasks.process_clip.process_clip",
    args: [clipId, s3Key],
    kwargs: {},
    retries: 0,
    eta: null,
    expires: null,
    utc: true,
    callbacks: null,
    errbacks: null,
    timelimit: [null, null],
    taskset: null,
    chord: null,
  });

  // Celery default queue key is "celery"
  await redis.lPush("celery", message);
  console.log(`Enqueued pipeline job ${taskId} for clip ${clipId}`);
  return taskId;
}
