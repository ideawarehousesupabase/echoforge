import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — EchoForge" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const doLogout = () => { logout(); navigate({ to: "/" }); };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details and plan.</p>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold">Account details</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
          <button onClick={doLogout} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-brand-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current plan</p>
              <p className="font-display text-lg font-semibold">Creator</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Unlimited generations, WAV + MP3 export, commercial use.</p>
          <button className="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface">Manage subscription</button>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="text-xs text-muted-foreground">Usage credits</p>
          <p className="mt-1 font-display text-3xl font-bold">58 <span className="text-base text-muted-foreground">/ 500</span></p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full bg-gradient-brand" style={{ width: "11.6%" }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Resets on the 1st of each month.</p>
        </div>
      </div>
    </div>
  );
}
