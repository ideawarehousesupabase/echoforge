import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, FolderKanban, Wand2, Library, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: Home },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/generate", label: "Generate", icon: Wand2 },
  { to: "/app/library", label: "Library", icon: Library },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const doLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-hero opacity-40" />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-surface/40 backdrop-blur-xl md:flex md:flex-col">
          <Link to="/" className="flex items-center gap-2 px-6 py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-brand-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">EchoForge</span>
          </Link>

          <nav className="flex-1 space-y-1 px-3">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-brand text-brand-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/60 p-3">
            <div className="rounded-lg bg-surface/60 p-3">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              <button
                onClick={doLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="relative flex-1 overflow-x-hidden">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-3 backdrop-blur-xl md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand">
                <Sparkles className="h-4 w-4 text-brand-foreground" />
              </div>
              <span className="font-display font-semibold">EchoForge</span>
            </Link>
            <button onClick={doLogout} className="text-xs text-muted-foreground">Sign out</button>
          </div>

          {/* Mobile nav */}
          <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border/60 bg-background/60 px-4 py-2 backdrop-blur-xl md:hidden">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                    active ? "bg-gradient-brand text-brand-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="animate-fade-in p-6 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
