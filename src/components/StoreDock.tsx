"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import {
  CatalogCell,
  CatalogGrid,
  CatalogGridPanel,
  CatalogSelectionBar,
} from "@/components/CatalogGrid";
import { PotSkinPreview } from "@/components/PotSkinPreview";
import { useAuth } from "@/components/AuthProvider";
import { getBackgroundById } from "@/lib/backgrounds";
import { isDevAccountEmail } from "@/lib/dev-account";
import {
  equipBackground,
  equipPotSkin,
  getEquipped,
  getOwnedItemKeys,
  INVENTORY_CHANGE_EVENT,
  isStoreItemOwned,
  purchase,
  type EquippedSlots,
} from "@/lib/inventory";
import { getPotionBalance, POTION_CHANGE_EVENT } from "@/lib/potion";
import {
  CATEGORY_LABELS,
  getStoreItemById,
  getStoreItemsByCategory,
  type StoreCategory,
  type StoreItem,
} from "@/lib/store-catalog";

const V1_CATEGORIES: StoreCategory[] = ["decorating", "sensory"];

function ItemPreview({ item }: { item: StoreItem }) {
  if (item.kind === "background") {
    const bgDef = getBackgroundById(item.unlockId);
    if (bgDef) {
      return (
        <BackgroundPreview
          background={bgDef}
          size="tile"
          className="!rounded-2xl shadow-sm"
        />
      );
    }
  }
  if (item.kind === "potSkin") {
    return (
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white shadow-sm sm:h-16 sm:w-16">
        <PotSkinPreview skinId={item.unlockId} className="h-11 w-10" />
      </span>
    );
  }
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-2xl shadow-sm sm:h-16 sm:w-16">
      🎵
    </span>
  );
}

export function StoreDock() {
  const { user } = useAuth();
  const unlimited = isDevAccountEmail(user?.email);
  const [balance, setBalance] = useState(0);
  const [ownedKeys, setOwnedKeys] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<EquippedSlots>(() => getEquipped());
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setBalance(getPotionBalance());
    setOwnedKeys(getOwnedItemKeys());
    setEquipped(getEquipped());
  }, []);

  useEffect(() => {
    refresh();
    function onPotionChange() {
      setBalance(getPotionBalance());
    }
    function onInventoryChange() {
      setOwnedKeys(getOwnedItemKeys());
      setEquipped(getEquipped());
    }
    window.addEventListener(POTION_CHANGE_EVENT, onPotionChange);
    window.addEventListener(INVENTORY_CHANGE_EVENT, onInventoryChange);
    return () => {
      window.removeEventListener(POTION_CHANGE_EVENT, onPotionChange);
      window.removeEventListener(INVENTORY_CHANGE_EVENT, onInventoryChange);
    };
  }, [refresh]);

  const itemsByCategory = useMemo(() => {
    return V1_CATEGORIES.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: getStoreItemsByCategory(cat),
    }));
  }, []);

  useEffect(() => {
    if (selectedId) return;
    const first = itemsByCategory[0]?.items[0];
    if (first) setSelectedId(first.id);
  }, [itemsByCategory, selectedId]);

  function isOwned(item: StoreItem) {
    return isStoreItemOwned(item) || ownedKeys.includes(`item:${item.id}`);
  }

  const selected = selectedId ? getStoreItemById(selectedId) : undefined;
  const selectedOwned = selected ? isOwned(selected) : false;
  const selectedEquipped =
    !!selected &&
    ((selected.kind === "background" &&
      equipped.backgroundId === selected.unlockId) ||
      (selected.kind === "potSkin" && equipped.potSkinId === selected.unlockId));
  const canBuy =
    !!selected &&
    !selectedOwned &&
    !selected.comingSoon &&
    (unlimited || balance >= selected.price) &&
    purchasing !== selected.id;

  function showToast(msg: string, ms = 1600) {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }

  function equipStoreItem(item: StoreItem) {
    if (item.kind === "background") {
      const result = equipBackground(item.unlockId);
      if (result.success) showToast(`${item.name} 배경을 적용했어요`);
      return;
    }
    if (item.kind === "potSkin") {
      const result = equipPotSkin(item.unlockId);
      if (result.success) showToast(`${item.name} 화분을 적용했어요`);
    }
  }

  function handleItemTap(item: StoreItem) {
    setSelectedId(item.id);
    if (isOwned(item) && !item.comingSoon) {
      equipStoreItem(item);
    }
  }

  function handlePurchase() {
    if (!selected || !canBuy) return;
    setPurchasing(selected.id);
    const result = purchase(selected.id);
    setPurchasing(null);
    if (result.success) {
      setBalance(result.balance);
      setOwnedKeys(getOwnedItemKeys());
      equipStoreItem(selected);
      showToast(`${selected.name}을(를) 구매하고 적용했어요!`, 1800);
    } else if (result.reason === "insufficient") {
      showToast("포션이 부족해요");
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {toast && (
        <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex justify-center">
          <p className="rounded-full border border-[#9caf88]/40 bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#6d8a5e] shadow-sm">
            {toast}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {itemsByCategory.map(({ category, label, items }) => (
          <section key={category}>
            <h2 className="mb-1.5 text-xs font-bold text-[#6d8a5e]">{label}</h2>
            <CatalogGridPanel className="!rounded-2xl !px-1 !py-1 sm:!px-2 sm:!py-2">
              <CatalogGrid>
                {items.map((item) => {
                  const owned = isOwned(item);
                  return (
                    <CatalogCell
                      key={item.id}
                      selected={selectedId === item.id}
                      onClick={() => handleItemTap(item)}
                      preview={<ItemPreview item={item} />}
                      price={item.price}
                      aria-label={`${item.name}, 포션 ${item.price}${owned ? ", 보유중" : item.comingSoon ? ", 준비중" : ""}`}
                      badge={
                        owned ? (
                          <span className="text-[10px] font-bold text-[#6d8a5e]">
                            ✓
                          </span>
                        ) : item.comingSoon ? (
                          <span className="text-[9px] font-bold text-[#8ba4b4]">
                            …
                          </span>
                        ) : null
                      }
                    />
                  );
                })}
              </CatalogGrid>
            </CatalogGridPanel>
          </section>
        ))}
      </div>

      {selected && (
        <div className="shrink-0 px-3 pb-3">
          <CatalogSelectionBar
            title={selected.name}
            subtitle={
              selectedOwned
                ? selectedEquipped
                  ? "지금 정원에 적용되어 있어요"
                  : "아이콘을 누르면 바로 적용돼요"
                : selected.comingSoon
                  ? "곧 만나볼 수 있어요"
                  : selected.description
            }
            action={
              selectedOwned ? (
                <span
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
                    selectedEquipped
                      ? "bg-[#9caf88]/25 text-[#6d8a5e]"
                      : "border border-[#9caf88]/40 bg-[#eef4e8] text-[#6d8a5e]"
                  }`}
                >
                  {selectedEquipped ? "적용됨" : "보유 중"}
                </span>
              ) : selected.comingSoon ? (
                <span className="shrink-0 rounded-xl border border-[#e8e0d4] bg-[#f5f0e8] px-3 py-2 text-xs font-semibold text-[#b5aea3]">
                  준비중
                </span>
              ) : (
                <button
                  type="button"
                  disabled={!canBuy}
                  onClick={handlePurchase}
                  className="shrink-0 rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {purchasing === selected.id
                    ? "구매 중…"
                    : !unlimited && balance < selected.price
                      ? "포션 부족"
                      : "구매"}
                </button>
              )
            }
          />
        </div>
      )}
    </div>
  );
}
