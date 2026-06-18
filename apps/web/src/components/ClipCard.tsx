"use client";

import { useState } from "react";
import type { Clip } from "@/lib/api";
import { getClipPreviewUrl } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  ready: "bg-green-500/10 text-green-400",
  processing: "bg-yellow-500/10 text-yellow-400",
  uploaded: "bg-blue-500/10 text-blue-400",
  pending: "bg-gray-500/10 text-gray-400",
  failed: "bg-red-500/10 text-red-400",
};

function formatDuration(secs: number | null) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}m ${s}s`;
}

export function ClipCard({ clip }: { clip: Clip }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openPreview() {
    setLoading(true);
    const url = await getClipPreviewUrl(clip.id);
    setLoading(false);
    if (url) setPreviewUrl(url);
  }

  return (
    <>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex flex-col gap-3 hover:border-gray-600 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-mono text-gray-500 truncate">{clip.id.slice(0, 8)}…</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[clip.status] ?? "bg-gray-800 text-gray-400"}`}>
            {clip.status}
          </span>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-white">{clip.task_type ?? "General work footage"}</p>
          <p className="text-sm text-gray-400">{clip.region ?? "Unknown region"}</p>
        </div>

        <div className="flex gap-4 text-sm text-gray-400">
          <span>⏱ {formatDuration(clip.duration_seconds)}</span>
          <span>📅 {new Date(clip.created_at).toLocaleDateString()}</span>
        </div>

        <div className="mt-auto flex gap-2">
          {clip.status === "ready" && (
            <button
              onClick={openPreview}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-300 text-sm font-medium py-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "▶ Preview"}
            </button>
          )}
          <button className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium py-2 transition-colors">
            License clip
          </button>
        </div>
      </div>

      {/* Video modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 z-10 text-white bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-black/90 transition"
            >
              ×
            </button>
            <video
              src={previewUrl}
              controls
              autoPlay
              className="w-full max-h-[80vh]"
            />
            <div className="px-4 py-3 bg-gray-900 text-sm text-gray-400 flex justify-between">
              <span>{clip.task_type ?? "General work footage"}</span>
              <span>{formatDuration(clip.duration_seconds)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
