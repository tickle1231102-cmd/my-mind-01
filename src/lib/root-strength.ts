export type RootSessionEntry = {
  id: string;
  dateKey: string;
  regret: string;
  gratitude: string;
  rootGain: number;
  createdAt: string;
};

export type RootState = {
  level: number;
  hp: number;
};

const ROOT_STATE_KEY = "healing-garden-root-state";
const ROOT_LEVEL_KEY = "healing-garden-root-level";
const ROOT_SESSIONS_KEY = "healing-garden-root-sessions";

export const MAX_ROOT_HP = 100;
export const ROOT_GAIN_PER_STEP = 15;
export const ROOT_GAIN_PER_SESSION = ROOT_GAIN_PER_STEP * 2;

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readLegacyRootPoints(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ROOT_LEVEL_KEY);
    if (!raw) return null;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function pointsToRootState(points: number): RootState {
  const safePoints = Math.max(0, points);
  return {
    level: Math.floor(safePoints / MAX_ROOT_HP),
    hp: safePoints % MAX_ROOT_HP,
  };
}

function readRootState(): RootState {
  if (typeof window === "undefined") return { level: 0, hp: 0 };

  try {
    const raw = window.localStorage.getItem(ROOT_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RootState;
      if (
        typeof parsed.level === "number" &&
        typeof parsed.hp === "number" &&
        parsed.level >= 0 &&
        parsed.hp >= 0 &&
        parsed.hp < MAX_ROOT_HP
      ) {
        return parsed;
      }
    }
  } catch {
    // fall through to legacy migration
  }

  const legacyPoints = readLegacyRootPoints();
  if (legacyPoints !== null) {
    const migrated = pointsToRootState(legacyPoints);
    writeRootState(migrated);
    window.localStorage.removeItem(ROOT_LEVEL_KEY);
    return migrated;
  }

  return { level: 0, hp: 0 };
}

function writeRootState(state: RootState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROOT_STATE_KEY, JSON.stringify(state));
}

export function getRootState(): RootState {
  return readRootState();
}

export function setRootState(state: RootState) {
  writeRootState({
    level: Math.max(0, state.level),
    hp: Math.max(0, Math.min(MAX_ROOT_HP - 1, state.hp)),
  });
}

export function applyRootGain(amount: number): { state: RootState; leveledUp: boolean } {
  const current = readRootState();
  let nextHp = current.hp + amount;
  let nextLevel = current.level;
  let leveledUp = false;

  if (nextHp >= MAX_ROOT_HP) {
    nextLevel += 1;
    nextHp = 0;
    leveledUp = true;
  }

  const nextState: RootState = { level: nextLevel, hp: nextHp };
  writeRootState(nextState);

  return { state: nextState, leveledUp };
}

export function getRootSessions(): RootSessionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ROOT_SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RootSessionEntry[];
  } catch {
    return [];
  }
}

export function saveRootSession(
  regret: string,
  gratitude: string,
): RootSessionEntry {
  const entry: RootSessionEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    dateKey: formatDateKey(new Date()),
    regret: regret.trim(),
    gratitude: gratitude.trim(),
    rootGain: ROOT_GAIN_PER_SESSION,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const sessions = getRootSessions();
    sessions.push(entry);
    window.localStorage.setItem(ROOT_SESSIONS_KEY, JSON.stringify(sessions));
  }

  return entry;
}

const ROOT_MILESTONE_LABELS: Record<number, string> = {
  0: "뿌리 막 내림",
  1: "얕은 뿌리",
  2: "단단한 뿌리",
  3: "깊은 뿌리",
  4: "굳건한 뿌리",
  5: "뿌리내린 마음",
};

export function getRootMilestoneLabel(rootLevel: number): string {
  const capped = Math.min(Math.max(rootLevel, 0), 5);
  return ROOT_MILESTONE_LABELS[capped] ?? ROOT_MILESTONE_LABELS[5];
}

/** 시련 이벤트 피해 감소율 (0~0.5). 추후 천둥·태풍 시스템에서 사용 */
export function getTrialDamageReduction(rootLevel: number): number {
  return Math.min(0.5, rootLevel / 10);
}

export function getReducedTrialDamage(
  baseDamage: number,
  rootLevel: number,
): number {
  const reduction = getTrialDamageReduction(rootLevel);
  return Math.round(baseDamage * (1 - reduction));
}
