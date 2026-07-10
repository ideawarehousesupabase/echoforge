import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, FolderOpen } from "lucide-react";
import { MOCK_PROJECTS, type MockProject } from "../lib/mock-data";
import { toast } from "sonner";


export const Route = createFileRoute("/app/projects/")({
  head: () => ({ meta: [{ title: "Projects — EchoForge" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [q, setQ] = useState("");
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const createProject = () => {
    if (!newName.trim()) return toast.error("Project needs a name.");
    const covers = [
      "linear-gradient(135deg, oklch(0.55 0.2 280), oklch(0.35 0.15 220))",
      "linear-gradient(135deg, oklch(0.6 0.17 30), oklch(0.4 0.15 350))",
      "linear-gradient(135deg, oklch(0.55 0.15 160), oklch(0.35 0.12 200))",
    ];
    const p: MockProject = {
      id: `prj_${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "New sound design project.",
      productionType: "Game",
      createdAt: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }),
      soundCount: 0,
      updatedAt: "just now",
      cover: covers[Math.floor(Math.random() * covers.length)],
      soundIds: [],
    };

    setProjects([p, ...projects]);
    setNewName("");
    setNewDesc("");
    setShowNew(false);
    toast.success("Project created.");
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
          <div className="mt-4 grid gap-4 md:grid-cols-2">
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
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={createProject} className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="glass group overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-glow">
            <div className="h-32" style={{ background: p.cover }} />
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{p.soundCount} sounds · {p.updatedAt}</p>
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
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">No projects match "{q}".</p>
        )}
      </div>
    </div>
  );
}
