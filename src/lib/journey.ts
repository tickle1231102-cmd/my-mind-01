import { getDatesWithMessages } from "./chat-history";
import { getPlantState } from "./plant-state";
import { addPotions, getPotionBalance } from "./potion";
import {
  getRootMilestoneLabel,
  getRootSessions,
  getRootState,
  type RootSessionEntry,
} from "./root-strength";

export type JourneyRealm = "surface" | "underground";

export type SurfaceTerrain = "hill" | "meadow" | "forest";
export type UndergroundTerrain = "soil" | "cave" | "ruins" | "abyss";
export type JourneyTerrain = SurfaceTerrain | UndergroundTerrain;

export type JourneyMilestone = {
  id: string;
  realm: JourneyRealm;
  terrain: JourneyTerrain;
  title: string;
  description: string;
  achieved: boolean;
  /** 달성 시 받을 수 있는 포션 개수. 0이면 보상이 없는 이정표(미래 여정 등). */
  potionReward: number;
  /** 달성 시 바텀시트에 보여줄 뿌리 세션 기억 */
  memorySessionId?: string;
};

export const REALM_LABELS: Record<JourneyRealm, string> = {
  surface: "지상",
  underground: "지하",
};

export const SURFACE_TERRAIN_ORDER: SurfaceTerrain[] = [
  "hill",
  "meadow",
  "forest",
];

export const UNDERGROUND_TERRAIN_ORDER: UndergroundTerrain[] = [
  "soil",
  "cave",
  "ruins",
  "abyss",
];

export const TERRAIN_LABELS: Record<JourneyTerrain, string> = {
  hill: "씨앗의 언덕",
  meadow: "새싹의 초원",
  forest: "개화의 숲",
  soil: "표토의 길",
  cave: "마음 동굴",
  ruins: "감사의 유적",
  abyss: "뿌리내린 심연",
};

const CLAIMED_KEY = "healing-garden-journey-claimed";

function readClaimed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CLAIMED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeClaimed(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLAIMED_KEY, JSON.stringify(Array.from(ids)));
}

export function getClaimedMilestoneIds(): Set<string> {
  return readClaimed();
}

/** 이정표 보상은 최초 1회만 받을 수 있다. */
export function claimMilestoneReward(
  id: string,
  reward: number,
): { claimed: boolean; balance: number } {
  const claimedIds = readClaimed();
  if (claimedIds.has(id) || reward <= 0) {
    return { claimed: false, balance: getPotionBalance() };
  }

  claimedIds.add(id);
  writeClaimed(claimedIds);
  const balance = addPotions(reward);
  return { claimed: true, balance };
}

export function getSessionById(id: string): RootSessionEntry | null {
  return getRootSessions().find((session) => session.id === id) ?? null;
}

function sessionAt(sessions: RootSessionEntry[], index: number): string | undefined {
  return sessions[index]?.id;
}

/**
 * 지상 여정 — 잎·꽃이 자라는 길.
 * 화분 레벨·대화 기록·뿌리 시작점을 바탕으로 자동 생성된다.
 */
export function buildSurfaceMilestones(): JourneyMilestone[] {
  const plant = getPlantState();
  const root = getRootState();
  const hasChatHistory = getDatesWithMessages().size > 0;

  return [
    {
      id: "start",
      realm: "surface",
      terrain: "hill",
      title: "첫 만남",
      description: "작은 씨앗과 처음 마음을 나눈 날이에요.",
      achieved: hasChatHistory,
      potionReward: 2,
    },
    {
      id: "level-1",
      realm: "surface",
      terrain: "hill",
      title: "Lv.1 · 싹트다",
      description: "작은 씨앗이 막 싹을 틔웠어요.",
      achieved: plant.level >= 1,
      potionReward: 3,
    },
    {
      id: "level-2",
      realm: "surface",
      terrain: "hill",
      title: "Lv.2 · 잎이 자라다",
      description: "잎이 하나둘 돋아나기 시작했어요.",
      achieved: plant.level >= 2,
      potionReward: 3,
    },
    {
      id: "root-1",
      realm: "surface",
      terrain: "meadow",
      title: "뿌리 막 내림",
      description:
        "후회를 감사로 바꾸는 뿌리 강화를 처음 시작했어요. 지하 여정이 열렸어요.",
      achieved: root.level >= 1 || root.hp > 0,
      potionReward: 4,
    },
    {
      id: "level-3",
      realm: "surface",
      terrain: "meadow",
      title: "Lv.3 · 줄기가 굵어지다",
      description: "줄기가 튼튼하게 자라고 있어요.",
      achieved: plant.level >= 3,
      potionReward: 4,
    },
    {
      id: "root-3",
      realm: "surface",
      terrain: "meadow",
      title: "뿌리내린 마음",
      description: "단단하게 뿌리내려 쉽게 흔들리지 않는 마음이 됐어요.",
      achieved: root.level >= 3,
      potionReward: 5,
    },
    {
      id: "level-4",
      realm: "surface",
      terrain: "forest",
      title: "Lv.4 · 꽃봉오리",
      description: "꽃봉오리가 맺히기 시작했어요.",
      achieved: plant.level >= 4,
      potionReward: 5,
    },
    {
      id: "level-5",
      realm: "surface",
      terrain: "forest",
      title: "Lv.5 · 만개",
      description: "꽃과 열매까지 열린 마음의 화분이에요!",
      achieved: plant.level >= 5,
      potionReward: 6,
    },
    {
      id: "horizon",
      realm: "surface",
      terrain: "forest",
      title: "이어지는 여정",
      description:
        "앞으로 더 많은 이야기가 이 길 위에 펼쳐질 거예요. 다음 여정을 기대해 주세요.",
      achieved: false,
      potionReward: 0,
    },
  ];
}

/**
 * 지하 여정 — 뿌리가 내려가는 길.
 * 뿌리 강화 세션·뿌리 레벨로 동굴·유적이 열린다.
 */
export function buildUndergroundMilestones(): JourneyMilestone[] {
  const root = getRootState();
  const sessions = getRootSessions();
  const sessionCount = sessions.length;
  const hasDug = sessionCount > 0 || root.level > 0 || root.hp > 0;

  return [
    {
      id: "ug-first-dig",
      realm: "underground",
      terrain: "soil",
      title: "첫 번째 파고들기",
      description:
        "표토를 가르고 처음으로 뿌리의 길을 열었어요. 후회 위에 감사가 내려앉기 시작했어요.",
      achieved: hasDug,
      potionReward: 3,
      memorySessionId: sessionAt(sessions, 0),
    },
    {
      id: "ug-root-1",
      realm: "underground",
      terrain: "soil",
      title: `${getRootMilestoneLabel(1)} · Lv.1`,
      description: "얕지만 분명한 뿌리가 자리를 잡기 시작했어요.",
      achieved: root.level >= 1,
      potionReward: 3,
    },
    {
      id: "ug-sessions-3",
      realm: "underground",
      terrain: "cave",
      title: "동굴의 입구",
      description:
        "세 번의 뿌리 강화로 마음 동굴의 문이 열렸어요. 어두운 곳에서도 길이 보입니다.",
      achieved: sessionCount >= 3,
      potionReward: 4,
      memorySessionId: sessionAt(sessions, 2),
    },
    {
      id: "ug-root-2",
      realm: "underground",
      terrain: "cave",
      title: `${getRootMilestoneLabel(2)} · Lv.2`,
      description: "동굴 안에서 뿌리가 더 단단하게 뻗어 나갔어요.",
      achieved: root.level >= 2,
      potionReward: 4,
    },
    {
      id: "ug-sessions-5",
      realm: "underground",
      terrain: "ruins",
      title: "유적의 문턱",
      description:
        "다섯 번의 성찰이 쌓여 감사의 유적이 드러났어요. 과거의 아픔이 돌이 아닌 받침이 됩니다.",
      achieved: sessionCount >= 5,
      potionReward: 5,
      memorySessionId: sessionAt(sessions, 4),
    },
    {
      id: "ug-root-3",
      realm: "underground",
      terrain: "ruins",
      title: `${getRootMilestoneLabel(3)} · Lv.3`,
      description: "깊은 뿌리가 유적을 지나 더 아래를 향하고 있어요.",
      achieved: root.level >= 3,
      potionReward: 5,
    },
    {
      id: "ug-root-4",
      realm: "underground",
      terrain: "abyss",
      title: `${getRootMilestoneLabel(4)} · Lv.4`,
      description: "심연에서도 흔들리지 않는 뿌리가 자리를 잡았어요.",
      achieved: root.level >= 4,
      potionReward: 6,
    },
    {
      id: "ug-root-5",
      realm: "underground",
      terrain: "abyss",
      title: `${getRootMilestoneLabel(5)} · Lv.5`,
      description:
        "뿌리내린 마음이 심연을 밝히고 있어요. 위로는 꽃, 아래로는 뿌리가 하나가 됩니다.",
      achieved: root.level >= 5,
      potionReward: 7,
    },
    {
      id: "ug-horizon",
      realm: "underground",
      terrain: "abyss",
      title: "더 깊은 곳",
      description:
        "아직 닿지 않은 지하의 이야기가 기다리고 있어요. 뿌리를 계속 내려보세요.",
      achieved: false,
      potionReward: 0,
    },
  ];
}

/** @deprecated buildSurfaceMilestones 사용 권장 — 하위 호환용 */
export function buildJourneyMilestones(): JourneyMilestone[] {
  return buildSurfaceMilestones();
}

export function buildMilestonesForRealm(
  realm: JourneyRealm,
): JourneyMilestone[] {
  return realm === "underground"
    ? buildUndergroundMilestones()
    : buildSurfaceMilestones();
}

/** 지하 여정이 열렸는지 — 뿌리 강화 한 번이라도 했으면 true */
export function isUndergroundUnlocked(): boolean {
  const root = getRootState();
  return getRootSessions().length > 0 || root.level > 0 || root.hp > 0;
}
