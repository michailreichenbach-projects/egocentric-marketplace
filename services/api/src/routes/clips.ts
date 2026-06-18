import { Router, Request, Response } from "express";
import { db } from "../db";
import { getPreviewUrl } from "../s3";

export const clipsRouter = Router();

/**
 * GET /clips
 * Query params: status, task_type, region
 * Returns clips available for licensing (status = 'ready' by default)
 */
clipsRouter.get("/", async (req: Request, res: Response) => {
  const { status = "ready", task_type, region } = req.query;

  const conditions: string[] = ["status = $1"];
  const values: unknown[] = [status];

  if (task_type) {
    conditions.push(`task_type = $${values.length + 1}`);
    values.push(task_type);
  }
  if (region) {
    conditions.push(`region = $${values.length + 1}`);
    values.push(region);
  }

  const result = await db.query(
    `SELECT id, worker_id, task_type, duration_seconds, region, status,
            raw_s3_key, processed_s3_key, created_at
     FROM video_clips
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC
     LIMIT 100`,
    values
  );

  return res.json(result.rows);
});

/**
 * GET /clips/:id/preview
 * Returns a short-lived presigned URL to stream the processed video.
 */
clipsRouter.get("/:id/preview", async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await db.query(
    "SELECT processed_s3_key FROM video_clips WHERE id = $1 AND status = 'ready'",
    [id]
  );

  if (result.rowCount === 0 || !result.rows[0].processed_s3_key) {
    return res.status(404).json({ error: "Clip not ready or not found" });
  }

  const url = await getPreviewUrl(result.rows[0].processed_s3_key);
  return res.json({ url });
});
