"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import { PotSkinPreview } from "@/components/PotSkinPreview";
import { PotionBadge } from "@/components/PotionBadge";
import {
  BACKGROUNDS,
  getBackgroundLabel,
  type BackgroundDef,
} from "@/lib/backgrounds";
import {
  equipBackground,
  equipPotSkin,
  getEquipped,
  getOwnedBackgroundIds,
  getOwnedPotSkinIds,
  INVENTORY_CHANGE_EVENT,
  type EquippedSlots,
} from "@/lib/inventory";
import { getPotSkinLabel, POT_SKINS, type PotSkinId } from "@/lib/store-catalog";

export default function ItemPage() {
  const [equipped, setEquipped] = useState<EquippedSlots>(() => getEquipped());
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([]);
  const [ownedPotSkins, setOwnedPotSkins] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEquipped(getEquipped());
    setOwnedBackgrounds(getOwnedBackgroundIds());
    setOwnedPotSkins(getOwnedPotSkinIds());
  }, []);

  useEffect(() => {
    refresh();
    function onChange() {
      refresh();
    }
    window.addEventListener(INVENTORY_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(INVENTORY_CHANGE_EVENT, onChange);
  }, [refresh]);

  const ownedBackgroundDefs = useMemo(() => {
    const set = new Set(ownedBackgrounds);
    return BACKGROUNDS.filter((bg) => set.has(bg.id));
  }, [ownedBackgrounds]);

  const ownedPotSkinList = useMemo(() => {
    const set = new Set(ownedPotSkins);
    return POT_SKINS.filter((s) => set.has(s.id));
  }, [ownedPotSkins]);

  const isEmpty = ownedBackgroundDefs.length <= 3 && ownedPotSkinList.length <= 1;

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }

  function handleEquipBackground(id: string) {
    const result = equipBackground(id);
    if (result.success) {
      setEquipped(getEquipped());
      showToast(`${getBackgroundLabel(id)} 배경을 적용했어요`);
    }
  }

  function handleEquipPotSkin(id: PotSkinId) {
    const result = equipPotSkin(id);
    if (result.success) {
      setEquipped(getEquipped());
      showToast(`${getPotSkinLabel(id)} 화분을 적용했어요`);
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
            <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">
              아이템 보관함
            </h1>
          </div>
          <PotionBadge href="/store" />
        </header>

        {/* Currently equipped summary */}
        <section className="mb-5 rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-[#8ba4b4]">
            현재 장착
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {(() => {
                const bg =
                  BACKGROUNDS.find((b) => b.id === equipped.backgroundId) ??
                  BACKGROUNDS[0];
                return <BackgroundPreview background={bg} size="sm" />;
              })()}
              <div>
                <p className="text-[10px] text-[#8ba4b4]">배경</p>
                <p className="text-sm font-semibold text-[#4a5248]">
                  {getBackgroundLabel(equipped.backgroundId)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PotSkinPreview skinId={equipped.potSkinId} />
              <div>
                <p className="text-[10px] text-[#8ba4b4]">화분</p>
                <p className="text-sm font-semibold text-[#4a5248]">
                  {getPotSkinLabel(equipped.potSkinId)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {isEmpty && ownedPotSkinList.length === 1 && (
          <div className="mb-5 rounded-2xl border border-dashed border-[#e8dcc8] bg-[#f5f0e8]/50 px-4 py-6 text-center">
            <p className="text-sm text-[#6d655c]">
              아직 구매한 꾸미기 아이템이 없어요.
            </p>
            <Link
              href="/store"
              className="mt-3 inline-block rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e]"
            >
              상점에서 둘러보기
            </Link>
          </div>
        )}

        {/* Backgrounds */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-[#6d8a5e]">배경 테마</h2>
          {ownedBackgroundDefs.length === 0 ? (
            <EmptyCategory hint="상점에서 배경 테마를 구매해 보세요." />
          ) : (
            <ul className="space-y-2">
              {ownedBackgroundDefs.map((bg) => (
                <BackgroundRow
                  key={bg.id}
                  bg={bg}
                  equipped={equipped.backgroundId === bg.id}
                  onEquip={() => handleEquipBackground(bg.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Pot skins */}
        <section>
          <h2 className="mb-3 text-sm font-bold text-[#6d8a5e]">화분 스킨</h2>
          {ownedPotSkinList.length === 0 ? (
            <EmptyCategory hint="상점에서 화분 스킨을 구매해 보세요." />
          ) : (
            <ul className="space-y-2">
              {ownedPotSkinList.map((skin) => (
                <PotSkinRow
                  key={skin.id}
                  skinId={skin.id}
                  label={skin.label}
                  equipped={equipped.potSkinId === skin.id}
                  onEquip={() => handleEquipPotSkin(skin.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyCategory({ hint }: { hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e8dcc8] bg-white/60 px-4 py-5 text-center">
      <p className="text-sm text-[#6d655c]">{hint}</p>
      <Link
        href="/store"
        className="mt-2 inline-block text-sm font-semibold text-[#6d8a5e] underline-offset-2 hover:underline"
      >
        상점으로 →
      </Link>
    </div>
  );
}

function BackgroundRow({
  bg,
  equipped,
  onEquip,
}: {
  bg: BackgroundDef;
  equipped: boolean;
  onEquip: () => void;
}) {
  return (
    <li>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
          equipped
            ? "border-[#9caf88]/50 bg-[#eef4e8]/80"
            : "border-[#e8e0d4] bg-white/90"
        }`}
      >
        <BackgroundPreview background={bg} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#4a5248]">{bg.label}</p>
          {equipped && (
            <p className="text-[10px] font-semibold text-[#6d8a5e]">장착 중</p>
          )}
        </div>
        {equipped ? (
          <span className="shrink-0 rounded-xl bg-[#9caf88]/25 px-3 py-1.5 text-xs font-semibold text-[#6d8a5e]">
            적용됨
          </span>
        ) : (
          <button
            type="button"
            onClick={onEquip}
            className="shrink-0 rounded-xl border border-[#9caf88]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#6d8a5e] transition hover:bg-[#eef4e8] active:scale-95"
          >
            장착
          </button>
        )}
      </div>
    </li>
  );
}

function PotSkinRow({
  skinId,
  label,
  equipped,
  onEquip,
}: {
  skinId: PotSkinId;
  label: string;
  equipped: boolean;
  onEquip: () => void;
}) {
  return (
    <li>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
          equipped
            ? "border-[#9caf88]/50 bg-[#eef4e8]/80"
            : "border-[#e8e0d4] bg-white/90"
        }`}
      >
        <PotSkinPreview skinId={skinId} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#4a5248]">{label}</p>
          {equipped && (
            <p className="text-[10px] font-semibold text-[#6d8a5e]">장착 중</p>
          )}
        </div>
        {equipped ? (
          <span className="shrink-0 rounded-xl bg-[#9caf88]/25 px-3 py-1.5 text-xs font-semibold text-[#6d8a5e]">
            적용됨
          </span>
        ) : (
          <button
            type="button"
            onClick={onEquip}
            className="shrink-0 rounded-xl border border-[#9caf88]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#6d8a5e] transition hover:bg-[#eef4e8] active:scale-95"
          >
            장착
          </button>
        )}
      </div>
    </li>
  );
}
