import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Heart, Loader2 } from "lucide-react";
import { CATEGORIES, MOODS } from "../lib/mock-data";
import { SoundCard } from "../components/SoundCard";
import { useAuth } from "../lib/auth";
import { useUserSounds } from "../hooks/useProjects";

export const Route = createFileRoute("/app/library")({
  head: () => ({ meta: [{ title: "Library — EchoForge" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const { sounds, loading } = useUserSounds(user?.id);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [mood, setMood] = useState("All");
  const [favsOnly, setFavsOnly] = useState(false);

  const filtered = useMemo(() => {
    return sounds.filter((s) => {
      if (favsOnly && !s.favorite) return false;
      if (cat !== "All" && s.category !== cat) return false;
      if (mood !== "All" && s.mood !== mood) return false;
      if (q) {
        const hay = `${s.title} ${s.prompt} ${s.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [sounds, q, cat, mood, favsOnly]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="font-display text-4xl font-bold">Asset Library</h1>
        <p className="mt-1 text-muted-foreground">All your generated sounds in one place.</p>
      </div>

      <div className="glass mt-8 flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-background/40 px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, prompt or tags…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={() => setFavsOnly(!favsOnly)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            favsOnly ? "border-brand bg-brand/10 text-brand" : "border-border bg-surface text-muted-foreground"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favsOnly ? "fill-current" : ""}`} /> Favorites
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <FilterRow label="Category" options={CATEGORIES} value={cat} onChange={setCat} />
        <FilterRow label="Mood" options={MOODS} value={mood} onChange={setMood} />
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <SoundCard key={s.id} sound={s} />)}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No sounds match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            value === o
              ? "border-brand bg-gradient-brand text-brand-foreground"
              : "border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
