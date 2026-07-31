"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import { PotSkinPreview } from "@/components/PotSkinPreview";
import { PotionBadge } from "@/components/PotionBadge";
import { PotionIcon } from "@/components/PotionIcon";
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
  getStoreItemsByCategory,
  type StoreCategory,
  type StoreItem,
} from "@/lib/store-catalog";

const V1_CATEGORIES: StoreCategory[] = ["decorating", "sensory"];

function StoreItemCard({
  item,
  owned,
  balance,
  onPurchase,
  purchasing,
}: {
  item: StoreItem;
  owned: boolean;
  balance: number;
  onPurchase: (id: string) => void;
  purchasing: string | null;
}) {
  const canBuy =
    !owned && !item.comingSoon && balance >= item.price && purchasing !== item.id;
  const bgDef =
    item.kind === "background" ? getBackgroundById(item.unlockId) : undefined;

  return (
    <article className="flex gap-3 rounded-2xl border border-[#e8e0d4] bg-white/90 p-3.5 shadow-sm">
      <div className="shrink-0">
        {item.kind === "background" && bgDef ? (
          <BackgroundPreview background={bgDef} size="md" />
        ) : item.kind === "potSkin" ? (
          <div className="flex h-20 w-28 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#f5f0e8]/80">
            <PotSkinPreview skinId={item.unlockId} />
          </div>
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#f0ebe3] text-2xl">
            🎵
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[#4a5248]">{item.name}</h3>
          {owned && (
            <span className="shrink-0 rounded-full bg-[#9caf88]/20 px-2 py-0.5 text-[10px] font-semibold text-[#6d8a5e]">
              보유중
            </span>
          )}
          {item.comingSoon && !owned && (
            <span className="shrink-0 rounded-full bg-[#e8e0d4]/80 px-2 py-0.5 text-[10px] font-semibold text-[#8ba4b4]">
              준비중
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#6d655c]">
          {item.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#4a5248]">
            <PotionIcon className="h-4 w-4 text-[#c98fd6]" />
            {item.price}
          </span>
          {owned ? (
            <Link
              href="/item"
              className="rounded-xl border border-[#9caf88]/40 bg-[#eef4e8] px-3 py-1.5 text-xs font-semibold text-[#6d8a5e] transition hover:bg-[#e4eedc]"
            >
              장착하기
            </Link>
          ) : item.comingSoon ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-[#e8e0d4] bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold text-[#b5aea3]"
            >
              준비중
            </button>
          ) : (
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => onPurchase(item.id)}
              className="rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {purchasing === item.id
                ? "구매 중…"
                : balance < item.price
                  ? "포션 부족"
                  : "구매"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StorePage() {
  const [balance, setBalance] = useState(0);
  const [ownedKeys, setOwnedKeys] = useState<string[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
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

  function handlePurchase(itemId: string) {
    setPurchasing(itemId);
    const result = purchase(itemId);
    setPurchasing(null);

    if (result.success) {
      setBalance(result.balance);
      setOwnedKeys(getOwnedItemKeys());
      const item = getStoreItemsByCategory("decorating")
        .concat(getStoreItemsByCategory("sensory"))
        .find((i) => i.id === itemId);
      setToast(`${item?.name ?? "아이템"}을(를) 구매했어요!`);
      window.setTimeout(() => setToast(null), 1800);
    } else if (result.reason === "insufficient") {
      setToast("포션이 부족해요");
      window.setTimeout(() => setToast(null), 1600);
    }
  }

  function isOwned(item: StoreItem) {
    return isStoreItemOwned(item) || ownedKeys.includes(`item:${item.id}`);
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
        <header className="mb-5 flex items-center gap-3">
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

        <p className="mb-5 text-sm leading-relaxed text-[#6d655c]">
          여정과 일일 퀘스트로 모은{" "}
          <span className="font-semibold text-[#6d8a5e]">포션</span>으로 정원을
          꾸며 보세요.
        </p>

        <div className="space-y-6">
          {itemsByCategory.map(({ category, label, items }) => (
            <section key={category}>
              <h2 className="mb-3 text-sm font-bold text-[#6d8a5e]">{label}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <StoreItemCard
                    key={item.id}
                    item={item}
                    owned={isOwned(item)}
                    balance={balance}
                    onPurchase={handlePurchase}
                    purchasing={purchasing}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
