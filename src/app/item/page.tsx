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

type SelectedSlot =
  | { kind: "background"; id: string }
  | { kind: "potSkin"; id: PotSkinId }
  | null;

export default function ItemPage() {
  const [equipped, setEquipped] = useState<EquippedSlots>(() => getEquipped());
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([]);
  const [ownedPotSkins, setOwnedPotSkins] = useState<string[]>([]);
  const [selected, setSelected] = useState<SelectedSlot>(null);
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

  useEffect(() => {
    if (selected) return;
    if (ownedBackgroundDefs[0]) {
      setSelected({ kind: "background", id: ownedBackgroundDefs[0].id });
    } else if (ownedPotSkinList[0]) {
      setSelected({ kind: "potSkin", id: ownedPotSkinList[0].id });
    }
  }, [ownedBackgroundDefs, ownedPotSkinList, selected]);

  const isSparse =
    ownedBackgroundDefs.length <= 3 && ownedPotSkinList.length <= 1;

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }

  function handleEquip() {
    if (!selected) return;
    if (selected.kind === "background") {
      const result = equipBackground(selected.id);
      if (result.success) {
        setEquipped(getEquipped());
        showToast(`${getBackgroundLabel(selected.id)} 배경을 적용했어요`);
      }
      return;
    }
    const result = equipPotSkin(selected.id);
    if (result.success) {
      setEquipped(getEquipped());
      showToast(`${getPotSkinLabel(selected.id)} 화분을 적용했어요`);
    }
  }

  const selectedIsEquipped =
    selected?.kind === "background"
      ? equipped.backgroundId === selected.id
      : selected?.kind === "potSkin"
        ? equipped.potSkinId === selected.id
        : false;

  const selectedTitle =
    selected?.kind === "background"
      ? getBackgroundLabel(selected.id)
      : selected?.kind === "potSkin"
        ? getPotSkinLabel(selected.id)
        : "";

  const selectedSubtitle =
    selected?.kind === "background"
      ? "배경 테마"
      : selected?.kind === "potSkin"
        ? "화분 스킨"
        : undefined;

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
            <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">
              아이템 보관함
            </h1>
          </div>
          <PotionBadge href="/store" />
        </header>

        {isSparse && (
          <div className="mb-4 rounded-2xl border border-dashed border-[#e8dcc8] bg-[#f5f0e8]/50 px-4 py-5 text-center">
            <p className="text-sm text-[#6d655c]">
              아직 구매한 꾸미기 아이템이 거의 없어요.
            </p>
            <Link
              href="/store"
              className="mt-3 inline-block rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e]"
            >
              상점에서 둘러보기
            </Link>
          </div>
        )}

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-[#6d8a5e]">배경 테마</h2>
          {ownedBackgroundDefs.length === 0 ? (
            <EmptyCategory />
          ) : (
            <CatalogGridPanel>
              <CatalogGrid>
                {ownedBackgroundDefs.map((bg) => (
                  <BackgroundCell
                    key={bg.id}
                    bg={bg}
                    selected={
                      selected?.kind === "background" && selected.id === bg.id
                    }
                    equipped={equipped.backgroundId === bg.id}
                    onSelect={() =>
                      setSelected({ kind: "background", id: bg.id })
                    }
                  />
                ))}
              </CatalogGrid>
            </CatalogGridPanel>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-[#6d8a5e]">화분 스킨</h2>
          {ownedPotSkinList.length === 0 ? (
            <EmptyCategory />
          ) : (
            <CatalogGridPanel>
              <CatalogGrid>
                {ownedPotSkinList.map((skin) => (
                  <CatalogCell
                    key={skin.id}
                    selected={
                      selected?.kind === "potSkin" && selected.id === skin.id
                    }
                    onClick={() =>
                      setSelected({ kind: "potSkin", id: skin.id })
                    }
                    preview={
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white shadow-sm sm:h-16 sm:w-16">
                        <PotSkinPreview
                          skinId={skin.id}
                          className="h-11 w-10"
                        />
                      </span>
                    }
                    label={skin.label}
                    aria-label={`${skin.label}${equipped.potSkinId === skin.id ? ", 장착 중" : ""}`}
                    badge={
                      equipped.potSkinId === skin.id ? (
                        <span className="text-[10px] font-bold text-[#6d8a5e]">
                          ✓
                        </span>
                      ) : null
                    }
                  />
                ))}
              </CatalogGrid>
            </CatalogGridPanel>
          )}
        </section>

        {selected && (
          <CatalogSelectionBar
            title={selectedTitle}
            subtitle={
              selectedIsEquipped
                ? `${selectedSubtitle} · 현재 적용 중`
                : selectedSubtitle
            }
            action={
              selectedIsEquipped ? (
                <span className="shrink-0 rounded-xl bg-[#9caf88]/25 px-3.5 py-2 text-xs font-bold text-[#6d8a5e]">
                  적용됨
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEquip}
                  className="shrink-0 rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-95"
                >
                  장착
                </button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

function EmptyCategory() {
  return (
    <div className="rounded-2xl border border-dashed border-[#e8dcc8] bg-white/60 px-4 py-5 text-center">
      <p className="text-sm text-[#6d655c]">상점에서 아이템을 구매해 보세요.</p>
      <Link
        href="/store"
        className="mt-2 inline-block text-sm font-semibold text-[#6d8a5e] underline-offset-2 hover:underline"
      >
        상점으로 →
      </Link>
    </div>
  );
}

function BackgroundCell({
  bg,
  selected,
  equipped,
  onSelect,
}: {
  bg: BackgroundDef;
  selected: boolean;
  equipped: boolean;
  onSelect: () => void;
}) {
  return (
    <CatalogCell
      selected={selected}
      onClick={onSelect}
      preview={
        <BackgroundPreview
          background={bg}
          size="tile"
          className="!rounded-2xl shadow-sm"
        />
      }
      label={bg.label}
      aria-label={`${bg.label}${equipped ? ", 장착 중" : ""}`}
      badge={
        equipped ? (
          <span className="text-[10px] font-bold text-[#6d8a5e]">✓</span>
        ) : null
      }
    />
  );
}
