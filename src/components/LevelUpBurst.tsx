"use client";

const CONFETTI = [
  { emoji: "✨", left: "8%", delay: "0s", duration: "1.35s", drift: "-18px" },
  { emoji: "🌸", left: "18%", delay: "0.05s", duration: "1.55s", drift: "22px" },
  { emoji: "★", left: "28%", delay: "0.12s", duration: "1.4s", drift: "-10px" },
  { emoji: "🎉", left: "38%", delay: "0s", duration: "1.6s", drift: "16px" },
  { emoji: "✨", left: "48%", delay: "0.08s", duration: "1.45s", drift: "-24px" },
  { emoji: "🌼", left: "58%", delay: "0.04s", duration: "1.5s", drift: "12px" },
  { emoji: "★", left: "68%", delay: "0.14s", duration: "1.35s", drift: "-14px" },
  { emoji: "🌸", left: "78%", delay: "0.02s", duration: "1.58s", drift: "20px" },
  { emoji: "✨", left: "88%", delay: "0.1s", duration: "1.42s", drift: "-8px" },
  { emoji: "💚", left: "12%", delay: "0.18s", duration: "1.48s", drift: "10px" },
  { emoji: "🌟", left: "72%", delay: "0.16s", duration: "1.52s", drift: "-20px" },
  { emoji: "🍃", left: "42%", delay: "0.2s", duration: "1.38s", drift: "18px" },
] as const;

export function LevelUpBurst({ level }: { level: number }) {
  return (
    <div
      className="level-up-burst pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-live="polite"
    >
      <div className="level-up-flash absolute inset-0" />
      {CONFETTI.map((piece, i) => (
        <span
          key={`${piece.emoji}-${i}`}
          className="level-up-confetti absolute text-lg sm:text-xl"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            ["--drift" as string]: piece.drift,
          }}
        >
          {piece.emoji}
        </span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="level-up-badge rounded-full border border-[#f3e2a8] bg-white/95 px-4 py-2 text-center shadow-lg backdrop-blur-sm">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#e0b04a]">
            LEVEL UP
          </p>
          <p className="text-lg font-extrabold leading-none text-[#6d8a5e]">
            Lv.{level}
          </p>
        </div>
      </div>
    </div>
  );
}
