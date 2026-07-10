type Props = {
  bars: number[];
  playing?: boolean;
  progress?: number; // 0..1
  height?: number;
  className?: string;
};

export function Waveform({ bars, playing = false, progress = 0, height = 56, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-[2px] ${className}`} style={{ height }}>
      {bars.map((v, i) => {
        const active = i / bars.length <= progress;
        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              height: `${Math.max(6, v * 100)}%`,
              background: active
                ? "var(--gradient-brand)"
                : "color-mix(in oklab, var(--foreground) 22%, transparent)",
              animation: playing ? `wave ${0.9 + (i % 5) * 0.12}s ease-in-out infinite` : undefined,
              animationDelay: playing ? `${(i % 7) * 0.05}s` : undefined,
              transformOrigin: "center",
            }}
          />
        );
      })}
    </div>
  );
}
