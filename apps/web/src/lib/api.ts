const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Clip {
  id: string;
  worker_id: string;
  task_type: string | null;
  duration_seconds: number | null;
  region: string | null;
  status: string;
  raw_s3_key: string;
  processed_s3_key: string | null;
  created_at: string;
}

export async function getClips(filters?: {
  status?: string;
  task_type?: string;
  region?: string;
}): Promise<Clip[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.task_type) params.set("task_type", filters.task_type);
  if (filters?.region) params.set("region", filters.region);
  const res = await fetch(`${API_URL}/clips?${params}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getClipPreviewUrl(id: string): Promise<string | null> {
  const res = await fetch(`${API_URL}/clips/${id}/preview`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.url;
}
