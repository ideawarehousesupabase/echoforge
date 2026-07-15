import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Wand2, Sparkles, TrendingUp, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useUserProjects, useUserSounds } from "../hooks/useProjects";
import { seedMockDataIfNeeded } from "../lib/firestore-data";
import { SoundCard } from "../components/SoundCard";
import type { Project } from "../lib/firestore-data";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — EchoForge" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const { projects, loading: projectsLoading, refetch: refetchProjects } = useUserProjects(user?.id);
  const { sounds, loading: soundsLoading, refetch: refetchSounds } = useUserSounds(user?.id);

  // Seed demo data on first login
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    seedMockDataIfNeeded(user.id).then(() => {
      if (cancelled) return;
      refetchProjects();
      refetchSounds();
    }).catch(console.error);
    return () => { cancelled = true; };
  }, [user?.id]);

  const loading = projectsLoading || soundsLoading;

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
    <div className="mx-auto max-w-7xl space-y-10">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-card p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">
              Hey {firstName} <span className="text-gradient-brand">✨</span>
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Ready to design your next sound? Start with a prompt or open a recent project.
            </p>
          </div>
          <Link
            to="/app/generate"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105"
          >
            <Wand2 className="h-4 w-4" /> Quick generate
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Sparkles, label: "Sounds generated", value: loading ? "…" : String(sounds.length) },
          { icon: TrendingUp, label: "Active projects", value: loading ? "…" : String(projects.length) },
          { icon: Clock, label: "Latest activity", value: loading ? "…" : (sounds.length > 0 ? formatRelative(sounds[0]?.createdAt ?? null) : "No activity") },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Recent projects</h2>
          <Link to="/app/projects" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projects.slice(0, 4).map((p) => (
              <Link key={p.id} to="/app/projects/$projectId" params={{ projectId: p.id }} className="glass overflow-hidden rounded-2xl transition-transform hover:-translate-y-1">
                <div className="h-24" style={{ background: p.cover }} />
                <div className="p-4">
                  <h3 className="truncate font-display font-semibold">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground">{p.productionType} · {formatRelative(p.updatedAt)}</p>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No projects yet.</p>
            )}
          </div>
        )}
      </section>

      {/* Recent sounds */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Recently generated</h2>
          <Link to="/app/library" className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
            Open library <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sounds.slice(0, 3).map((s) => <SoundCard key={s.id} sound={s} />)}
            {sounds.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No sounds generated yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
