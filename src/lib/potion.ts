/**
 * 포션(Potion) — 여정 이정표·일일 퀘스트 등으로 얻는 재화.
 * 추후 Store/Item 탭에서 소비할 수 있도록 설계된 잔고 시스템.
 */

export const POTION_LABEL = "포션";
export const POTION_CHANGE_EVENT = "healing-garden-potion-change";

const POTION_BALANCE_KEY = "healing-garden-potion-balance";

function readBalance(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(POTION_BALANCE_KEY);
    if (!raw) return 0;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeBalance(balance: number) {
  if (typeof window === "undefined") return;
  const next = Math.max(0, balance);
  window.localStorage.setItem(POTION_BALANCE_KEY, String(next));
  window.dispatchEvent(
    new CustomEvent(POTION_CHANGE_EVENT, { detail: { balance: next } }),
  );
}

export function getPotionBalance(): number {
  return readBalance();
}

export function addPotions(amount: number): number {
  if (amount <= 0) return readBalance();
  const next = readBalance() + amount;
  writeBalance(next);
  return next;
}

export function spendPotions(
  amount: number,
): { success: boolean; balance: number } {
  const current = readBalance();
  if (amount <= 0 || current < amount) {
    return { success: false, balance: current };
  }
  const next = current - amount;
  writeBalance(next);
  return { success: true, balance: next };
}
