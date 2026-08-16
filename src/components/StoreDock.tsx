"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import {
  CatalogCell,
  CatalogGrid,
  CatalogGridPanel,
} from "@/components/CatalogGrid";
import { PotionIcon } from "@/components/PotionIcon";
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
          className="!rounded-lg shadow-sm"
        />
      );
    }
  }
  if (item.kind === "potSkin") {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white shadow-sm sm:h-11 sm:w-11">
        <PotSkinPreview skinId={item.unlockId} className="h-8 w-7" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white text-lg shadow-sm sm:h-11 sm:w-11">
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
  const [purchasing, setPurchasing] = useState(false);
  const [pendingItem, setPendingItem] = useState<StoreItem | null>(null);
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

  function isOwned(item: StoreItem) {
    return isStoreItemOwned(item) || ownedKeys.includes(`item:${item.id}`);
  }

  const canBuyPending =
    !!pendingItem &&
    !isOwned(pendingItem) &&
    !pendingItem.comingSoon &&
    (unlimited || balance >= pendingItem.price) &&
    !purchasing;

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
    if (item.comingSoon) {
      showToast("곧 만나볼 수 있어요");
      return;
    }
    if (isOwned(item)) {
      equipStoreItem(item);
      return;
    }
    setPendingItem(item);
  }

  function handlePurchase() {
    if (!pendingItem || !canBuyPending) {
      if (pendingItem && !unlimited && balance < pendingItem.price) {
        showToast("포션이 부족해요");
      }
      return;
    }
    setPurchasing(true);
    const result = purchase(pendingItem.id);
    setPurchasing(false);
    if (result.success) {
      setBalance(result.balance);
      setOwnedKeys(getOwnedItemKeys());
      equipStoreItem(pendingItem);
      setPendingItem(null);
      showToast(`${pendingItem.name}을(를) 구매하고 적용했어요!`, 1800);
    } else if (result.reason === "insufficient") {
      showToast("포션이 부족해요");
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {toast && (
        <div className="pointer-events-none absolute inset-x-2 top-2 z-20 flex justify-center">
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
                  const equippedNow =
                    (item.kind === "background" &&
                      equipped.backgroundId === item.unlockId) ||
                    (item.kind === "potSkin" &&
                      equipped.potSkinId === item.unlockId);
                  return (
                    <CatalogCell
                      key={item.id}
                      selected={pendingItem?.id === item.id || equippedNow}
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

      {pendingItem && (
        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-[#4a5248]/25"
            aria-label="구매 창 닫기"
            onClick={() => setPendingItem(null)}
          />
          <div className="relative rounded-t-2xl border border-[#e8e0d4] bg-[#FDFBF7] px-4 pb-4 pt-3 shadow-[0_-8px_24px_rgba(74,82,72,0.12)]">
            <div className="mb-3 flex items-center gap-3">
              <ItemPreview item={pendingItem} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#4a5248]">
                  {pendingItem.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#8ba4b4]">
                  {pendingItem.description}
                </p>
                <p className="mt-1 inline-flex items-center gap-0.5 text-xs font-bold text-[#4a5248]">
                  <PotionIcon className="h-3.5 w-3.5 text-[#c98fd6]" />
                  {pendingItem.price}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingItem(null)}
                className="flex-1 rounded-xl border border-[#e8dcc8] bg-white px-3 py-2.5 text-sm font-semibold text-[#4a5248] transition hover:bg-[#F5F0E8]"
              >
                닫기
              </button>
              <button
                type="button"
                disabled={purchasing}
                onClick={handlePurchase}
                className="flex-[1.4] rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {purchasing
                  ? "구매 중…"
                  : !unlimited && balance < pendingItem.price
                    ? "포션 부족"
                    : "구매하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
