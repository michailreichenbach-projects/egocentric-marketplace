import { getClips } from "@/lib/api";
import { ClipCard } from "@/components/ClipCard";

const TASK_TYPES = ["All", "Carpentry", "Plumbing", "Electrical", "Masonry", "Welding"];
const REGIONS = ["All", "RS", "ME", "HR", "BA", "US"];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { task_type?: string; region?: string };
}) {
  const task_type = searchParams.task_type !== "All" ? searchParams.task_type : undefined;
  const region = searchParams.region !== "All" ? searchParams.region : undefined;

  const clips = await getClips({ status: "ready", task_type, region });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">POV Video Datasets</h1>
        <p className="text-gray-400 max-w-xl">
          Egocentric footage from skilled craftsmen across Europe. 
          License raw or processed data for physical AI and robotics training.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total clips", value: clips.length },
          { label: "Ready to license", value: clips.filter(c => c.status === "ready").length },
          { label: "Hours of footage", value: `${Math.round(clips.reduce((a, c) => a + (c.duration_seconds ?? 0), 0) / 3600)}h` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-400">Task:</label>
          <select name="task_type" defaultValue={searchParams.task_type ?? "All"}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-400">Region:</label>
          <select name="region" defaultValue={searchParams.region ?? "All"}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit"
          className="bg-brand-600 hover:bg-brand-500 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
          Filter
        </button>
      </form>

      {/* Grid */}
      {clips.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">📹</p>
          <p>No clips available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clips.map(clip => <ClipCard key={clip.id} clip={clip} />)}
        </div>
      )}
    </div>
  );
}
