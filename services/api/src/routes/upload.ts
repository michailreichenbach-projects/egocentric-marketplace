import { Router, Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { getUploadUrl } from "../s3";
import { enqueuePipelineJob } from "../redis";

export const uploadRouter = Router();

// Schema for requesting a pre-signed upload URL
const InitUploadSchema = z.object({
  worker_id: z.string().uuid(),
  filename: z.string().min(1),
  content_type: z.string().regex(/^video\//),
  duration_seconds: z.number().positive().optional(),
  device_id: z.string().optional(),
});

/**
 * POST /upload/init
 * Body: { worker_id, filename, content_type, duration_seconds?, device_id? }
 * Returns: { upload_url, clip_id, s3_key }
 *
 * The companion app uploads directly to S3 using the signed URL,
 * then calls /upload/complete to record the clip in the DB.
 */
uploadRouter.post("/init", async (req: Request, res: Response) => {
  const parsed = InitUploadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { worker_id, filename, content_type, duration_seconds, device_id } =
    parsed.data;

  // Check worker exists
  const workerCheck = await db.query(
    "SELECT id FROM workers WHERE id = $1",
    [worker_id]
  );
  if (workerCheck.rowCount === 0) {
    return res.status(404).json({ error: "Worker not found or inactive" });
  }

  const clip_id = uuidv4();
  const ext = filename.split(".").pop() || "mp4";
  const s3_key = `raw/${worker_id}/${clip_id}.${ext}`;

  const upload_url = await getUploadUrl(s3_key, content_type);

  // Insert clip record in PENDING state
  await db.query(
    `INSERT INTO video_clips
       (id, worker_id, raw_s3_key, status, duration_seconds)
     VALUES ($1, $2, $3, 'pending', $4)`,
    [clip_id, worker_id, s3_key, duration_seconds ?? null]
  );

  return res.json({ upload_url, clip_id, s3_key });
});

/**
 * POST /upload/complete
 * Body: { clip_id }
 * Called after the companion app finishes uploading to S3.
 * Transitions clip status from 'pending' → 'uploaded' and enqueues processing.
 */
uploadRouter.post("/complete", async (req: Request, res: Response) => {
  const { clip_id } = req.body;
  if (!clip_id) return res.status(400).json({ error: "clip_id required" });

  const result = await db.query(
    `UPDATE video_clips SET status = 'uploaded'
     WHERE id = $1 AND status = 'pending'
     RETURNING id, raw_s3_key AS s3_key`,
    [clip_id]
  );

  if (result.rowCount === 0) {
    return res
      .status(404)
      .json({ error: "Clip not found or already completed" });
  }

  const { s3_key } = result.rows[0];
  await enqueuePipelineJob(clip_id, s3_key);

  return res.json({ clip_id, status: "uploaded" });
});

/**
 * GET /upload/status/:clip_id
 * Returns current processing status for a clip.
 */
uploadRouter.get("/status/:clip_id", async (req: Request, res: Response) => {
  const { clip_id } = req.params;
  const result = await db.query(
    "SELECT id, status, duration_seconds, created_at FROM video_clips WHERE id = $1",
    [clip_id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Clip not found" });
  }
  return res.json(result.rows[0]);
});
