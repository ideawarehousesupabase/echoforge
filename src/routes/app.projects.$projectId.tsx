import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Plus, Calendar, Clock, Music2, Tag, Loader2 } from "lucide-react";
import { useProject, useProjectSounds } from "../hooks/useProjects";
import { SoundCard } from "../components/SoundCard";
import type { Project } from "../lib/firestore-data";

export const Route = createFileRoute("/app/projects/$projectId")({
  head: () => ({ meta: [{ title: "Project Details — EchoForge" }] }),
  component: ProjectDetailsPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl p-10 text-center">
      <h1 className="font-display text-2xl font-bold">Project not found</h1>
      <Link to="/app/projects" className="mt-4 inline-block text-brand hover:underline">
        Back to Projects
      </Link>
    </div>
  ),
});

function ProjectDetailsPage() {
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const { project, loading: projectLoading } = useProject(projectId);
  const { sounds, loading: soundsLoading } = useProjectSounds(projectId);

  if (projectLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-bold">Project not found</h1>
        <p className="mt-2 text-muted-foreground">The project you're looking for doesn't exist.</p>
        <Link
          to="/app/projects"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  const formatDate = (ts: Project["createdAt"]) => {
    if (!ts) return "—";
    const d = ts.toDate();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const formatRelative = (ts: Project["updatedAt"]) => {
    if (!ts) return "—";
    const now = Date.now();
    const then = ts.toDate().getTime();
    const diffMs = now - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {/* Header card */}
      <div className="glass-strong overflow-hidden rounded-3xl">
        <div className="h-40 md:h-48" style={{ background: project.cover }} />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-medium text-brand">
                  <Tag className="mr-1 inline h-3 w-3" />
                  {project.productionType}
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{project.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/app/projects"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Link>
              <Link
                to="/app/generate"
                search={{ projectId }}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Generate New Sound
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat icon={<Calendar className="h-4 w-4" />} label="Created" value={formatDate(project.createdAt)} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Last Updated" value={formatRelative(project.updatedAt)} />
            <Stat icon={<Music2 className="h-4 w-4" />} label="Sounds" value={String(sounds.length)} />
            <Stat icon={<Tag className="h-4 w-4" />} label="Type" value={project.productionType} />
          </div>
        </div>
      </div>

      {/* Sounds */}
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold">Generated Sounds</h2>
          <p className="text-sm text-muted-foreground">{sounds.length} in this project</p>
        </div>

        {soundsLoading ? (
          <div className="mt-6 flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : sounds.length === 0 ? (
          <div className="glass mt-6 rounded-2xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No sounds yet. Generate your first one.</p>
            <Link
              to="/app/generate"
              search={{ projectId }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" /> Generate New Sound
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sounds.map((s) => (
              <SoundCard key={s.id} sound={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1.5 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
