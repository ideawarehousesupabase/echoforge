import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Pause, Sliders } from "lucide-react";
import { Waveform } from "./Waveform";

type SoundLike = {
  id: string;
  title: string;
  prompt: string;
  mood: string;
  category: string;
  tags: string[];
  duration: string;
  audioUrl: string;
  waveform: number[];
  favorite?: boolean;
};

export function SoundCard({ sound }: { sound: SoundLike }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  };

  return (
    <div className="group bg-gradient-card glass rounded-2xl p-5 transition-all hover:shadow-glow hover:-translate-y-1">
      <audio
        ref={audioRef}
        src={sound.audioUrl}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setProgress(a.currentTime / a.duration);
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold">{sound.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sound.category} · {sound.mood} · {sound.duration}
          </p>
        </div>
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground shadow-glow transition-transform hover:scale-110"
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </button>
      </div>

      <div className="mt-4">
        <Waveform bars={sound.waveform} playing={playing} progress={progress} height={52} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {sound.tags.slice(0, 4).map((t) => (
          <span key={t} className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{sound.duration}</span>
        <Link
          to="/app/editor/$id"
          params={{ id: sound.id }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
        >
          <Sliders className="h-3.5 w-3.5" /> Open Editor
        </Link>
      </div>
    </div>
  );
}
