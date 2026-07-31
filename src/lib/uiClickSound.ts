const UI_CLICK_SRC = "/sounds/pop11.mp3";
const UI_CLICK_VOLUME = 0.32;
const POOL_SIZE = 3;
export const UI_CLICK_STORAGE_KEY = "healing-garden-ui-click";

let pool: HTMLAudioElement[] = [];
let poolIndex = 0;
let enabled = true;

function getPool(): HTMLAudioElement[] {
  if (typeof window === "undefined") return [];
  if (pool.length === 0) {
    pool = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(UI_CLICK_SRC);
      audio.preload = "auto";
      audio.volume = UI_CLICK_VOLUME;
      return audio;
    });
  }
  return pool;
}

export function loadUiClickEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(UI_CLICK_STORAGE_KEY);
  enabled = saved !== "off";
  return enabled;
}

export function setUiClickEnabled(next: boolean): void {
  enabled = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(UI_CLICK_STORAGE_KEY, next ? "on" : "off");
  }
}

export function isUiClickEnabled(): boolean {
  return enabled;
}

/** Short soft UI tap — reuses pop11 at lower volume than the pot watering SFX. */
export function playUiClick(): void {
  if (typeof window === "undefined" || !enabled) return;
  const elements = getPool();
  if (elements.length === 0) return;

  const audio = elements[poolIndex % POOL_SIZE]!;
  poolIndex = (poolIndex + 1) % POOL_SIZE;
  audio.currentTime = 0;
  void audio.play().catch(() => {});
}
