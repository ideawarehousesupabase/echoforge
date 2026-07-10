import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — EchoForge" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("Please fill in all fields.");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Enter a valid email.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created — please sign in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-70" />
      <div className="relative w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-brand-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">EchoForge</span>
        </Link>

        <div className="glass-strong rounded-3xl p-8 shadow-soft">
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start designing sound in minutes.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {[
              { label: "Name", type: "text", value: name, set: setName, ph: "Ada Lovelace", ac: "name" },
              { label: "Email", type: "email", value: email, set: setEmail, ph: "you@studio.com", ac: "email" },
              { label: "Password", type: "password", value: password, set: setPassword, ph: "At least 6 characters", ac: "new-password" },
              { label: "Confirm password", type: "password", value: confirm, set: setConfirm, ph: "Repeat password", ac: "new-password" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  autoComplete={f.ac}
                  className="mt-1 w-full rounded-lg border border-input bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring"
                  placeholder={f.ph}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-brand hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
