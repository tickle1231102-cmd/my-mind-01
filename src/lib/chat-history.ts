export type Sentiment = "positive" | "negative" | "neutral";

export type StoredMessage = {
  id: number;
  from: "user" | "bot";
  text: string;
  tone?: Sentiment;
};

const STORAGE_KEY = "healing-garden-chat-logs";

export const CHAT_LOGS_CHANGE_EVENT = "healing-garden-chat-logs-changed";

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatKoreanDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function readAllLogs(): Record<string, StoredMessage[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredMessage[]>;
  } catch {
    return {};
  }
}

function writeAllLogs(
  logs: Record<string, StoredMessage[]>,
  options?: { skipCloud?: boolean },
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  window.dispatchEvent(new Event(CHAT_LOGS_CHANGE_EVENT));
  if (!options?.skipCloud) {
    void import("@/lib/cloud-sync").then((m) => m.scheduleCloudSave());
  }
}

export function getAllChatLogs(): Record<string, StoredMessage[]> {
  return readAllLogs();
}

export function replaceAllChatLogs(
  logs: Record<string, StoredMessage[]>,
  options?: { skipCloud?: boolean },
) {
  writeAllLogs(logs, options);
}

export function saveDayMessages(dateKey: string, messages: StoredMessage[]) {
  const logs = readAllLogs();
  logs[dateKey] = messages;
  writeAllLogs(logs);
}

export function getDayMessages(dateKey: string): StoredMessage[] {
  return readAllLogs()[dateKey] ?? [];
}

export function getDatesWithMessages(): Set<string> {
  const logs = readAllLogs();
  return new Set(
    Object.entries(logs)
      .filter(([, msgs]) => msgs.some((m) => m.from === "user"))
      .map(([key]) => key),
  );
}

export function isToday(dateKey: string): boolean {
  return dateKey === formatDateKey(new Date());
}
