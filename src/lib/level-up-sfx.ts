let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gain: number,
  type: OscillatorType = "triangle",
) {
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** 레벨업 축하 팡파르 — 사용자 제스처 직후에 호출해야 iOS에서 재생됩니다. */
export function playLevelUpFanfare() {
  const ctx = getCtx();
  if (!ctx) return;
  void ctx.resume().catch(() => {});
  const now = ctx.currentTime + 0.02;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    tone(ctx, freq, now + i * 0.11, 0.32, 0.16);
  });
  tone(ctx, 1318.51, now + 0.46, 0.28, 0.1, "sine");
  tone(ctx, 1567.98, now + 0.54, 0.34, 0.09, "sine");
  tone(ctx, 2093.0, now + 0.62, 0.4, 0.07, "sine");
}
