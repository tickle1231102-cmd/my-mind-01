"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import {
  CatalogCell,
  CatalogGrid,
  CatalogGridPanel,
  CatalogSelectionBar,
} from "@/components/CatalogGrid";
import { PotSkinPreview } from "@/components/PotSkinPreview";
import { PotionBadge } from "@/components/PotionBadge";
import { getBackgroundById } from "@/lib/backgrounds";
import {
  getOwnedItemKeys,
  INVENTORY_CHANGE_EVENT,
  isStoreItemOwned,
  purchase,
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

export default function StorePage() {
  const [balance, setBalance] = useState(0);
  const [ownedKeys, setOwnedKeys] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setBalance(getPotionBalance());
    setOwnedKeys(getOwnedItemKeys());
  }, []);

  useEffect(() => {
    refresh();

    function onPotionChange() {
      setBalance(getPotionBalance());
    }
    function onInventoryChange() {
      setOwnedKeys(getOwnedItemKeys());
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
  const canBuy =
    !!selected &&
    !selectedOwned &&
    !selected.comingSoon &&
    balance >= selected.price &&
    purchasing !== selected.id;

  function handlePurchase() {
    if (!selected || !canBuy) return;
    setPurchasing(selected.id);
    const result = purchase(selected.id);
    setPurchasing(null);

    if (result.success) {
      setBalance(result.balance);
      setOwnedKeys(getOwnedItemKeys());
      setToast(`${selected.name}을(를) 구매했어요!`);
      window.setTimeout(() => setToast(null), 1800);
    } else if (result.reason === "insufficient") {
      setToast("포션이 부족해요");
      window.setTimeout(() => setToast(null), 1600);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#FDFBF7]">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#9caf88]/14 blur-3xl" />
        <div className="absolute -right-16 top-1/4 h-52 w-52 rounded-full bg-[#a3bcc9]/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#e8a598]/12 blur-3xl" />
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
          <p className="rounded-full border border-[#9caf88]/40 bg-white/95 px-4 py-2 text-sm font-semibold text-[#6d8a5e] shadow-md backdrop-blur-sm">
            {toast}
          </p>
        </div>
      )}

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-6 sm:py-8">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white/90 text-lg text-[#4a5248] shadow-sm transition hover:bg-white"
            aria-label="메인으로 돌아가기"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8ba4b4]">
              HEALING GARDEN
            </p>
            <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">상점</h1>
          </div>
          <PotionBadge href="/store" />
        </header>

        <p className="mb-4 text-sm leading-relaxed text-[#6d655c]">
          아이콘을 고른 뒤 포션으로 구매해 정원을 꾸며 보세요.
        </p>

        <div className="space-y-5">
          {itemsByCategory.map(({ category, label, items }) => (
            <section key={category}>
              <h2 className="mb-2 text-sm font-bold text-[#6d8a5e]">{label}</h2>
              <CatalogGridPanel>
                <CatalogGrid>
                  {items.map((item) => {
                    const owned = isOwned(item);
                    return (
                      <CatalogCell
                        key={item.id}
                        selected={selectedId === item.id}
                        onClick={() => setSelectedId(item.id)}
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
          <CatalogSelectionBar
            title={selected.name}
            subtitle={
              selectedOwned
                ? "보유 중 · 아이템 보관함에서 장착할 수 있어요"
                : selected.comingSoon
                  ? "곧 만나볼 수 있어요"
                  : selected.description
            }
            action={
              selectedOwned ? (
                <Link
                  href="/item"
                  className="shrink-0 rounded-xl border border-[#9caf88]/40 bg-[#eef4e8] px-3.5 py-2 text-xs font-bold text-[#6d8a5e] transition hover:bg-[#e4eedc] active:scale-95"
                >
                  장착하기
                </Link>
              ) : selected.comingSoon ? (
                <span className="shrink-0 rounded-xl border border-[#e8e0d4] bg-[#f5f0e8] px-3.5 py-2 text-xs font-semibold text-[#b5aea3]">
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
                    : balance < selected.price
                      ? "포션 부족"
                      : "구매"}
                </button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}
