/**
 * 아이템 보관함 — localStorage 기반 소유·장착 상태.
 */

import {
  DEFAULT_FREE_BACKGROUND_IDS,
  type BackgroundId,
} from "@/lib/backgrounds";
import { canAffordPotions, getPotionBalance, spendPotions } from "@/lib/potion";
import {
  DEFAULT_FREE_POT_SKIN_ID,
  getStoreItemById,
  type PotSkinId,
  type StoreItem,
} from "@/lib/store-catalog";

export const INVENTORY_CHANGE_EVENT = "healing-garden-inventory-change";

const INVENTORY_KEY = "healing-garden-inventory";

export type EquippedSlots = {
  backgroundId: BackgroundId;
  potSkinId: PotSkinId;
  bgmPackId: string | null;
};

type InventoryStore = {
  ownedIds: string[];
  equipped: EquippedSlots;
};

const DEFAULT_OWNED_IDS = [
  ...DEFAULT_FREE_BACKGROUND_IDS.map((id) => `bg:${id}`),
  `pot:${DEFAULT_FREE_POT_SKIN_ID}`,
];

const DEFAULT_EQUIPPED: EquippedSlots = {
  backgroundId: "room",
  potSkinId: DEFAULT_FREE_POT_SKIN_ID,
  bgmPackId: null,
};

function ownedKeyForStoreItem(item: StoreItem): string {
  switch (item.kind) {
    case "background":
      return `bg:${item.unlockId}`;
    case "potSkin":
      return `pot:${item.unlockId}`;
    case "bgmPack":
      return `bgm:${item.unlockId}`;
    default:
      return `item:${item.id}`;
  }
}

function readStore(): InventoryStore {
  if (typeof window === "undefined") {
    return { ownedIds: [...DEFAULT_OWNED_IDS], equipped: { ...DEFAULT_EQUIPPED } };
  }
  try {
    const raw = window.localStorage.getItem(INVENTORY_KEY);
    if (!raw) {
      return { ownedIds: [...DEFAULT_OWNED_IDS], equipped: { ...DEFAULT_EQUIPPED } };
    }
    const parsed = JSON.parse(raw) as Partial<InventoryStore>;
    const ownedSet = new Set([...DEFAULT_OWNED_IDS, ...(parsed.ownedIds ?? [])]);
    return {
      ownedIds: Array.from(ownedSet),
      equipped: {
        backgroundId:
          (parsed.equipped?.backgroundId as BackgroundId) ??
          DEFAULT_EQUIPPED.backgroundId,
        potSkinId:
          (parsed.equipped?.potSkinId as PotSkinId) ??
          DEFAULT_EQUIPPED.potSkinId,
        bgmPackId: parsed.equipped?.bgmPackId ?? null,
      },
    };
  } catch {
    return { ownedIds: [...DEFAULT_OWNED_IDS], equipped: { ...DEFAULT_EQUIPPED } };
  }
}

function writeStore(store: InventoryStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(INVENTORY_CHANGE_EVENT));
}

function persist(store: InventoryStore) {
  writeStore(store);
}

export function getInventory(): InventoryStore {
  return readStore();
}

export function getOwnedItemKeys(): string[] {
  return readStore().ownedIds;
}

export function isOwnedKey(key: string): boolean {
  return readStore().ownedIds.includes(key);
}

export function isStoreItemOwned(item: StoreItem): boolean {
  return isOwnedKey(ownedKeyForStoreItem(item));
}

export function getEquipped(): EquippedSlots {
  return { ...readStore().equipped };
}

export function ownsBackground(id: string): boolean {
  return isOwnedKey(`bg:${id}`);
}

export function ownsPotSkin(id: string): boolean {
  return isOwnedKey(`pot:${id}`);
}

export function getOwnedBackgroundIds(): BackgroundId[] {
  return readStore()
    .ownedIds.filter((k) => k.startsWith("bg:"))
    .map((k) => k.slice(3) as BackgroundId);
}

export function getOwnedPotSkinIds(): PotSkinId[] {
  return readStore()
    .ownedIds.filter((k) => k.startsWith("pot:"))
    .map((k) => k.slice(4) as PotSkinId);
}

export type PurchaseResult =
  | { success: true; balance: number }
  | {
      success: false;
      reason: "not_found" | "already_owned" | "coming_soon" | "insufficient";
      balance: number;
    };

export function purchase(itemId: string): PurchaseResult {
  const balance = getPotionBalance();
  const item = getStoreItemById(itemId);
  if (!item) {
    return { success: false, reason: "not_found", balance };
  }
  if (item.comingSoon) {
    return { success: false, reason: "coming_soon", balance };
  }
  const key = ownedKeyForStoreItem(item);
  const store = readStore();
  if (store.ownedIds.includes(key)) {
    return { success: false, reason: "already_owned", balance };
  }

  if (!canAffordPotions(item.price)) {
    return { success: false, reason: "insufficient", balance };
  }
  const spend = spendPotions(item.price);
  if (!spend.success) {
    return { success: false, reason: "insufficient", balance: spend.balance };
  }

  store.ownedIds.push(key);
  persist(store);
  return { success: true, balance: spend.balance };
}

export type EquipResult =
  | { success: true }
  | { success: false; reason: "not_owned" | "invalid_slot" | "invalid_item" };

export function equipBackground(backgroundId: string): EquipResult {
  if (!ownsBackground(backgroundId)) {
    return { success: false, reason: "not_owned" };
  }
  const store = readStore();
  store.equipped.backgroundId = backgroundId as BackgroundId;
  persist(store);
  return { success: true };
}

export function equipPotSkin(potSkinId: string): EquipResult {
  if (!ownsPotSkin(potSkinId)) {
    return { success: false, reason: "not_owned" };
  }
  const store = readStore();
  store.equipped.potSkinId = potSkinId as PotSkinId;
  persist(store);
  return { success: true };
}

export function equipBgmPack(bgmPackId: string | null): EquipResult {
  if (bgmPackId !== null && !isOwnedKey(`bgm:${bgmPackId}`)) {
    return { success: false, reason: "not_owned" };
  }
  const store = readStore();
  store.equipped.bgmPackId = bgmPackId;
  persist(store);
  return { success: true };
}

export function unequipPotSkin(): EquipResult {
  return equipPotSkin(DEFAULT_FREE_POT_SKIN_ID);
}
