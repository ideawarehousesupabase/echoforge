import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Wand2, Sliders, Download, Film, Gamepad2, Music, Mic, Megaphone, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-5 w-5 text-brand-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">EchoForge</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#users" className="text-sm text-muted-foreground hover:text-foreground">For</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link to="/register" className="rounded-lg bg-gradient-brand px-4 py-1.5 text-sm font-medium text-brand-foreground shadow-glow transition-transform hover:scale-105">
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
            AI-native sound design, built for creators
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Turn ideas into <span className="text-gradient-brand">cinematic sound</span>
            <br /> in seconds.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Describe a scene. Get production-ready ambiences, SFX, and score sketches — then refine them in real-time. No plugins. No sample hunting.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105">
              Start creating free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-medium backdrop-blur-xl hover:bg-surface">
              See how it works
            </a>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="glass-strong rounded-3xl p-6 shadow-soft">
              <div className="flex items-center gap-2 text-left text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent2/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand/70" />
                </div>
                <span className="ml-3">Prompt: "dark dungeon ambience with distant water drips"</span>
              </div>
              <div className="mt-4 flex items-end gap-[3px] rounded-xl bg-background/60 p-6" style={{ height: 160 }}>
                {Array.from({ length: 96 }).map((_, i) => {
                  const v = 0.15 + Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.19)) * 0.85;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-full"
                      style={{
                        height: `${v * 100}%`,
                        background: "var(--gradient-brand)",
                        opacity: 0.5 + v * 0.5,
                        animation: `wave ${0.8 + (i % 6) * 0.1}s ease-in-out ${i * 0.02}s infinite`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Everything you need to design sound</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Not a DAW replacement — a creative accelerator. Sketch ideas at the speed of thought.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Wand2, title: "Prompt to sound", desc: "Describe a mood, scene, or texture. Get multiple takes to choose from." },
            { icon: Sliders, title: "Real-time refinement", desc: "Sculpt intensity, tone, texture and space with intuitive controls." },
            { icon: Download, title: "Export anywhere", desc: "Download WAV or MP3 stems ready for your DAW, edit or engine." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gradient-card glass rounded-2xl p-8 transition-transform hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
                <Icon className="h-6 w-6 text-brand-foreground" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/40 bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">A workflow in four steps</h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              { n: "01", t: "Prompt", d: "Type an idea, or pick a suggestion." },
              { n: "02", t: "Generate", d: "AI proposes multiple sound options." },
              { n: "03", t: "Refine", d: "Dial in the vibe with creative controls." },
              { n: "04", t: "Export", d: "Send WAV/MP3 to your project." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border/60 bg-surface/60 p-6 backdrop-blur-xl">
                <span className="text-gradient-brand font-display text-3xl font-bold">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target users */}
      <section id="users" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">Made for creative teams</h2>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: Film, label: "Filmmakers" },
            { icon: Gamepad2, label: "Game devs" },
            { icon: Music, label: "Music producers" },
            { icon: Megaphone, label: "Ad agencies" },
            { icon: Mic, label: "Podcasters" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-2xl p-6 text-center">
              <Icon className="mx-auto h-8 w-8 text-brand" />
              <p className="mt-3 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/40 bg-surface/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Simple, creator-friendly pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready to ship.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: "Starter", price: "$0", desc: "For exploring", features: ["50 generations / mo", "MP3 export", "Personal use"], cta: "Start free", highlight: false },
              { name: "Creator", price: "$19", desc: "For serious makers", features: ["Unlimited generations", "WAV + MP3 export", "Refinement studio", "Commercial use"], cta: "Go Creator", highlight: true },
              { name: "Studio", price: "$49", desc: "For teams", features: ["Everything in Creator", "Shared library", "Priority queue", "Team seats"], cta: "Contact us", highlight: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-3xl p-8 ${
                  p.highlight
                    ? "bg-gradient-card border-2 border-brand/60 shadow-glow"
                    : "glass border border-border/60"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-brand" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-8 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    p.highlight
                      ? "bg-gradient-brand text-brand-foreground shadow-glow"
                      : "border border-border bg-surface"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-card p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-60" />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Ready to design sound at the speed of thought?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Free forever plan. No credit card required.</p>
            <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105">
              Create your account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-brand">
              <Sparkles className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <span>© {new Date().getFullYear()} EchoForge. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
