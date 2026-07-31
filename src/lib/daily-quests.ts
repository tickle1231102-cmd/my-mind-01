import { formatDateKey } from "./chat-history";
import { addPotions, getPotionBalance } from "./potion";

export type DailyQuestId = "chat" | "water" | "root";

export type DailyQuestDef = {
  id: DailyQuestId;
  title: string;
  description: string;
  potionReward: number;
};

export const DAILY_QUESTS: DailyQuestDef[] = [
  {
    id: "chat",
    title: "마음 기록하기",
    description: "오늘 감정을 한 번 적어 보세요",
    potionReward: 1,
  },
  {
    id: "water",
    title: "화분에 물 주기",
    description: "씨앗을 터치해 물을 주세요",
    potionReward: 1,
  },
  {
    id: "root",
    title: "뿌리 강화하기",
    description: "후회를 감사로 바꿔 보세요",
    potionReward: 2,
  },
];

/** 세 퀘스트를 모두 완료하면 추가로 받는 포션 */
export const ALL_CLEAR_BONUS = 2;

export type DailyQuestProgress = {
  dateKey: string;
  completed: Record<DailyQuestId, boolean>;
  bonusClaimed: boolean;
};

type DayQuestStore = {
  dateKey: string;
  completed: Partial<Record<DailyQuestId, boolean>>;
  bonusClaimed: boolean;
};

function storageKey(dateKey: string): string {
  return `healing-garden-daily-quests-${dateKey}`;
}

function emptyProgress(dateKey: string): DailyQuestProgress {
  return {
    dateKey,
    completed: { chat: false, water: false, root: false },
    bonusClaimed: false,
  };
}

function readStore(dateKey: string): DayQuestStore {
  if (typeof window === "undefined") {
    return { dateKey, completed: {}, bonusClaimed: false };
  }
  try {
    const raw = window.localStorage.getItem(storageKey(dateKey));
    if (!raw) return { dateKey, completed: {}, bonusClaimed: false };
    const parsed = JSON.parse(raw) as DayQuestStore;
    return {
      dateKey,
      completed: parsed.completed ?? {},
      bonusClaimed: Boolean(parsed.bonusClaimed),
    };
  } catch {
    return { dateKey, completed: {}, bonusClaimed: false };
  }
}

function writeStore(store: DayQuestStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(store.dateKey), JSON.stringify(store));
}

export function getTodayQuestProgress(): DailyQuestProgress {
  const dateKey = formatDateKey(new Date());
  const store = readStore(dateKey);
  return {
    dateKey,
    completed: {
      chat: Boolean(store.completed.chat),
      water: Boolean(store.completed.water),
      root: Boolean(store.completed.root),
    },
    bonusClaimed: store.bonusClaimed,
  };
}

export function getQuestDef(id: DailyQuestId): DailyQuestDef {
  return DAILY_QUESTS.find((q) => q.id === id) ?? DAILY_QUESTS[0];
}

export type CompleteQuestResult = {
  newlyCompleted: boolean;
  potionGained: number;
  bonusGained: number;
  balance: number;
  progress: DailyQuestProgress;
};

/**
 * 일일 퀘스트를 완료 처리한다. 이미 완료된 퀘스트는 무시한다.
 * 완료 시 포션이 즉시 지급되고, 세 개를 모두 끝내면 보너스도 한 번 지급된다.
 */
export function completeDailyQuest(id: DailyQuestId): CompleteQuestResult {
  const dateKey = formatDateKey(new Date());
  const store = readStore(dateKey);
  const progress = emptyProgress(dateKey);
  progress.completed = {
    chat: Boolean(store.completed.chat),
    water: Boolean(store.completed.water),
    root: Boolean(store.completed.root),
  };
  progress.bonusClaimed = store.bonusClaimed;

  if (progress.completed[id]) {
    return {
      newlyCompleted: false,
      potionGained: 0,
      bonusGained: 0,
      balance: getPotionBalance(),
      progress,
    };
  }

  progress.completed[id] = true;
  const def = getQuestDef(id);
  let potionGained = def.potionReward;
  let bonusGained = 0;

  const allDone = DAILY_QUESTS.every((q) => progress.completed[q.id]);
  if (allDone && !progress.bonusClaimed) {
    bonusGained = ALL_CLEAR_BONUS;
    progress.bonusClaimed = true;
  }

  writeStore({
    dateKey,
    completed: progress.completed,
    bonusClaimed: progress.bonusClaimed,
  });

  const balance = addPotions(potionGained + bonusGained);

  return {
    newlyCompleted: true,
    potionGained,
    bonusGained,
    balance,
    progress,
  };
}
