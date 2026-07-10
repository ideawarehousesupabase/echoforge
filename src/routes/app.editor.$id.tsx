import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Play, Pause, Download, ArrowLeft, RotateCcw } from "lucide-react";
import { MOCK_SOUNDS } from "../lib/mock-data";
import { Waveform } from "../components/Waveform";
import { toast } from "sonner";

export const Route = createFileRoute("/app/editor/$id")({
  head: () => ({ meta: [{ title: "Sound Editor — EchoForge" }] }),
  component: EditorPage,
});

const CONTROLS = [
  { key: "intensity", label: "Intensity", desc: "Overall energy" },
  { key: "tone", label: "Tone", desc: "Dark ↔ Bright" },
  { key: "texture", label: "Texture", desc: "Clean ↔ Gritty" },
  { key: "brightness", label: "Brightness", desc: "Warm ↔ Airy" },
  { key: "dynamics", label: "Dynamics", desc: "Flat ↔ Punchy" },
  { key: "spatial", label: "Spatial Feel", desc: "Close ↔ Vast" },
] as const;

function EditorPage() {
  const { id } = useParams({ from: "/app/editor/$id" });
  const sound = MOCK_SOUNDS.find((s) => s.id === id) ?? MOCK_SOUNDS[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(CONTROLS.map((c) => [c.key, 50]))
  );

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  const reset = () => {
    setValues(Object.fromEntries(CONTROLS.map((c) => [c.key, 50])));
    toast.info("Controls reset.");
  };

  const exportFile = async (format: "wav" | "mp3") => {
    try {
      const res = await fetch(`/audio/sample.${format}`);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sound.title.replace(/\s+/g, "_").toLowerCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`✓ ${format.toUpperCase()} exported successfully`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };


  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link to="/app/generate" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Preview */}
      <div className="glass-strong overflow-hidden rounded-3xl">
        <audio
          ref={audioRef}
          src={sound.audioUrl}
          onEnded={() => { setPlaying(false); setProgress(0); }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget;
            if (a.duration) setProgress(a.currentTime / a.duration);
          }}
        />
        <div className="relative overflow-hidden p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-40" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">{sound.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  <span className="text-foreground/80">Prompt:</span> {sound.prompt}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-xs text-brand">{sound.category}</span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs">{sound.mood}</span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs">{sound.duration}</span>
                  {sound.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border bg-surface/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground shadow-glow transition-transform hover:scale-110"
              >
                {playing ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-[2px]" />}
              </button>
            </div>

            <div className="mt-8">
              <Waveform bars={sound.waveform} playing={playing} progress={progress} height={120} />
            </div>
          </div>
        </div>

        {/* Export bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-surface/40 px-6 py-4 md:px-10">
          <span className="text-sm text-muted-foreground">Ready to ship? Export a lossless or compressed file.</span>
          <div className="flex gap-2">
            <button
              onClick={() => exportFile("wav")}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow transition-transform hover:scale-105"
            >
              <Download className="h-4 w-4" /> Export WAV
            </button>
            <button
              onClick={() => exportFile("mp3")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-2"
            >
              <Download className="h-4 w-4" /> Export MP3
            </button>
          </div>
        </div>
      </div>

      {/* Refinement */}
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Refinement Studio</h2>
            <p className="mt-1 text-sm text-muted-foreground">Adjust the character in real-time.</p>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-surface">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {CONTROLS.map((c) => (
            <div key={c.key} className="rounded-2xl border border-border/60 bg-surface/40 p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-display font-semibold">{c.label}</h3>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <span className="text-gradient-brand font-display text-2xl font-bold tabular-nums">
                  {values[c.key]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={values[c.key]}
                onChange={(e) => setValues({ ...values, [c.key]: Number(e.target.value) })}
                className="mt-4 w-full accent-[color:var(--brand)]"
                style={{
                  background: `linear-gradient(to right, oklch(0.72 0.19 305) 0%, oklch(0.78 0.17 200) ${values[c.key]}%, oklch(1 0 0 / 0.1) ${values[c.key]}%)`,
                  height: 6,
                  borderRadius: 999,
                  appearance: "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
