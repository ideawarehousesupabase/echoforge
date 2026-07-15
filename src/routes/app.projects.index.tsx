import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { createProject } from "../lib/firestore-data";
import { useUserProjects } from "../hooks/useProjects";
import type { Project } from "../lib/firestore-data";

const PRODUCTION_TYPES = ["Game", "Film", "Podcast", "Advertisement", "Music", "Other"];

const COVERS = [
  "linear-gradient(135deg, oklch(0.42 0.15 280), oklch(0.28 0.12 260))",
  "linear-gradient(135deg, oklch(0.55 0.15 160), oklch(0.35 0.12 200))",
  "linear-gradient(135deg, oklch(0.55 0.19 30), oklch(0.4 0.18 350))",
  "linear-gradient(135deg, oklch(0.6 0.18 250), oklch(0.4 0.2 300))",
  "linear-gradient(135deg, oklch(0.5 0.2 120), oklch(0.35 0.15 80))",
];

export const Route = createFileRoute("/app/projects/")({
  head: () => ({ meta: [{ title: "Projects — EchoForge" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, refetch } = useUserProjects(user?.id);
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Game");
  const [creating, setCreating] = useState(false);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error("Project needs a name.");
    if (!user) return toast.error("You must be logged in.");
    setCreating(true);
    try {
      await createProject(user.id, {
        name: newName.trim(),
        description: newDesc.trim() || "New sound design project.",
        productionType: newType,
        cover: COVERS[Math.floor(Math.random() * COVERS.length)],
      });
      setNewName("");
      setNewDesc("");
      setNewType("Game");
      setShowNew(false);
      toast.success("Project created.");
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (ts: Project["createdAt"]) => {
    if (!ts) return "—";
    const d = ts.toDate();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl font-bold">Projects</h1>
          <p className="mt-1 text-muted-foreground">Organize your sounds by production.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="glass mt-8 flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showNew && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">New project</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              className="rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description"
              className="rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
            >
              {PRODUCTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow disabled:opacity-50"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="h-32" style={{ background: p.cover }} />
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{p.productionType} · {formatDate(p.createdAt)}</p>
                  <Link
                    to="/app/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-2"
                  >
                    <FolderOpen className="h-3.5 w-3.5" /> Open
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              {q ? `No projects match "${q}".` : "No projects yet. Create your first one!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
