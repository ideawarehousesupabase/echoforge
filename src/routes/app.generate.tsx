import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { MOCK_SOUNDS, SUGGESTED_PROMPTS, makeWaveform, type MockSound } from "../lib/mock-data";
import { SoundCard } from "../components/SoundCard";

export const Route = createFileRoute("/app/generate")({
  head: () => ({ meta: [{ title: "Generate — EchoForge" }] }),
  component: GeneratePage,
});

function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MockSound[] | null>(null);

  const generate = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      // pick 4 mock sounds, re-title them from the prompt
      const pool = [...MOCK_SOUNDS].sort(() => Math.random() - 0.5).slice(0, 4);
      const generated = pool.map((s, i) => ({
        ...s,
        id: `gen_${Date.now()}_${i}`,
        title: `${prompt} — Take ${i + 1}`,
        prompt,
        waveform: makeWaveform(Date.now() + i * 37),
      }));
      setResults(generated);
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> AI Sound Generator
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">
          Describe the <span className="text-gradient-brand">sound</span> you hear.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Be specific: mood, textures, instruments, environment. The more vivid, the better.
        </p>
      </div>

      <div className="glass-strong mt-10 rounded-3xl p-6 shadow-soft">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g. Dark cathedral choir with distant thunder and low sub drone"
          className="w-full resize-none rounded-xl border border-input bg-background/40 p-4 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-2 border-border border-t-brand" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-brand animate-pulse-glow" />
            </div>
          </div>
          <p className="mt-6 font-display text-lg">Designing sound from your prompt…</p>
          <p className="mt-1 text-sm text-muted-foreground">This usually takes a few seconds.</p>
        </div>
      )}

      {results && (
        <section className="mt-12 animate-fade-in">
          <h2 className="font-display text-2xl font-semibold">Generated variations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Preview, pick your favorite, and open the editor to refine.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {results.map((s) => <SoundCard key={s.id} sound={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
