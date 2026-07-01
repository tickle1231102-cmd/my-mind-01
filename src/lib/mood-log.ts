import {
  detectSentiment,
  hasAngrySignal,
  hasAnxiousSignal,
  hasLoveSignal,
  type Sentiment,
} from "./sentiment";
import { getDayMessages, type StoredMessage } from "./chat-history";

export type MoodKind =
  | "joy"
  | "love"
  | "calm"
  | "neutral"
  | "anxious"
  | "sad"
  | "angry";

export type MoodEntry = {
  id: string;
  text: string;
  tone: Sentiment;
  createdAt: string;
};

export type DailyMood = {
  dateKey: string;
  mood: MoodKind;
  entryCount: number;
};

type MoodLogStore = Record<string, MoodEntry[]>;

const STORAGE_KEY = "healing-garden-mood-log";

function readStore(): MoodLogStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MoodLogStore;
  } catch {
    return {};
  }
}

function writeStore(store: MoodLogStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function recordMoodEntry(text: string, tone?: Sentiment) {
  const resolvedTone = tone ?? detectSentiment(text);
  const now = new Date();
  const dateKey = formatDateKey(now);
  const store = readStore();
  const entries = store[dateKey] ?? [];

  entries.push({
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    tone: resolvedTone,
    createdAt: now.toISOString(),
  });

  store[dateKey] = entries;
  writeStore(store);
}

export function getEntriesForDate(dateKey: string): MoodEntry[] {
  return readStore()[dateKey] ?? [];
}

export function getRepresentativeMood(entries: MoodEntry[]): MoodKind | null {
  if (entries.length === 0) return null;

  let score = 0;
  let angrySignals = 0;
  let anxiousSignals = 0;
  let loveSignals = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (const entry of entries) {
    if (entry.tone === "positive") {
      score += 1;
      positiveCount += 1;
    } else if (entry.tone === "negative") {
      score -= 1;
      negativeCount += 1;
    } else {
      neutralCount += 1;
    }

    if (hasAngrySignal(entry.text)) angrySignals += 1;
    if (hasAnxiousSignal(entry.text)) anxiousSignals += 1;
    if (hasLoveSignal(entry.text)) loveSignals += 1;
  }

  if (loveSignals >= 2 || (score >= 2 && loveSignals >= 1)) return "love";
  if (score >= 2) return "joy";
  if (score <= -2 && angrySignals > anxiousSignals) return "angry";
  if (score <= -1 && anxiousSignals > 0) return "anxious";
  if (score <= -1) return "sad";
  if (positiveCount > negativeCount) return "joy";
  if (negativeCount > positiveCount) return "sad";
  if (neutralCount > 0 && positiveCount === 0 && negativeCount === 0) {
    return "calm";
  }
  return "neutral";
}

function messagesToMoodEntries(messages: StoredMessage[]): MoodEntry[] {
  return messages
    .filter(
      (message): message is StoredMessage & { tone: Sentiment } =>
        message.from === "user" && !!message.tone,
    )
    .map((message) => ({
      id: `chat-${message.id}`,
      text: message.text,
      tone: message.tone,
      createdAt: "",
    }));
}

export function getRepresentativeMoodFromMessages(
  messages: StoredMessage[],
): MoodKind | null {
  return getRepresentativeMood(messagesToMoodEntries(messages));
}

export function getMoodForDate(dateKey: string): MoodKind | null {
  const fromLog = getRepresentativeMood(getEntriesForDate(dateKey));
  if (fromLog) return fromLog;
  return getRepresentativeMoodFromMessages(getDayMessages(dateKey));
}

export function getDailyMood(dateKey: string): DailyMood | null {
  const entries = getEntriesForDate(dateKey);
  const mood = getRepresentativeMood(entries);
  if (!mood) return null;
  return { dateKey, mood, entryCount: entries.length };
}

export function getMoodsForMonth(year: number, month: number): Record<string, MoodKind> {
  const result: Record<string, MoodKind> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(new Date(year, month, day));
    const mood = getMoodForDate(dateKey);
    if (mood) result[dateKey] = mood;
  }

  return result;
}

export const MOOD_LABELS: Record<MoodKind, string> = {
  joy: "기쁨",
  love: "사랑",
  calm: "평온",
  neutral: "무난",
  anxious: "불안",
  sad: "슬픔",
  angry: "화남",
};
