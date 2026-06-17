// Shared TypeScript types across services and frontend

export interface VideoClip {
  id: string;
  workerId: string;
  taskType: string;
  durationSeconds: number;
  region: string;
  status: "raw" | "processing" | "redacted" | "enriched" | "listed";
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  region: string;
  consentSignedAt: string;
}

export interface Buyer {
  id: string;
  organisation: string;
  email: string;
}
