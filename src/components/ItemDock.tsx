"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BackgroundPreview } from "@/components/BackgroundPreview";
import {
  CatalogCell,
  CatalogGrid,
  CatalogGridPanel,
} from "@/components/CatalogGrid";
import { PotSkinPreview } from "@/components/PotSkinPreview";
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

export function ItemDock({ onOpenStore }: { onOpenStore: () => void }) {
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
    window.addEventListener(INVENTORY_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(INVENTORY_CHANGE_EVENT, refresh);
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
    setSelected({ kind: "background", id: equipped.backgroundId });
  }, [equipped.backgroundId, selected]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }

  function applyBackground(id: string) {
    setSelected({ kind: "background", id });
    if (equipped.backgroundId === id) return;
    const result = equipBackground(id);
    if (result.success) {
      setEquipped(getEquipped());
      showToast(`${getBackgroundLabel(id)} 배경을 적용했어요`);
    }
  }

  function applyPotSkin(id: PotSkinId) {
    setSelected({ kind: "potSkin", id });
    if (equipped.potSkinId === id) return;
    const result = equipPotSkin(id);
    if (result.success) {
      setEquipped(getEquipped());
      showToast(`${getPotSkinLabel(id)} 화분을 적용했어요`);
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

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3">
        <section>
          <h2 className="mb-1.5 text-xs font-bold text-[#6d8a5e]">배경 테마</h2>
          {ownedBackgroundDefs.length === 0 ? (
            <EmptyCategory onOpenStore={onOpenStore} />
          ) : (
            <CatalogGridPanel className="!rounded-2xl !px-1 !py-1 sm:!px-2 sm:!py-2">
              <CatalogGrid>
                {ownedBackgroundDefs.map((bg) => (
                  <BackgroundCell
                    key={bg.id}
                    bg={bg}
                    selected={
                      selected?.kind === "background" && selected.id === bg.id
                    }
                    equipped={equipped.backgroundId === bg.id}
                    onSelect={() => applyBackground(bg.id)}
                  />
                ))}
              </CatalogGrid>
            </CatalogGridPanel>
          )}
        </section>

        <section>
          <h2 className="mb-1.5 text-xs font-bold text-[#6d8a5e]">화분 스킨</h2>
          {ownedPotSkinList.length === 0 ? (
            <EmptyCategory onOpenStore={onOpenStore} />
          ) : (
            <CatalogGridPanel className="!rounded-2xl !px-1 !py-1 sm:!px-2 sm:!py-2">
              <CatalogGrid>
                {ownedPotSkinList.map((skin) => (
                  <CatalogCell
                    key={skin.id}
                    selected={
                      selected?.kind === "potSkin" && selected.id === skin.id
                    }
                    onClick={() => applyPotSkin(skin.id)}
                    preview={
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white shadow-sm sm:h-11 sm:w-11">
                        <PotSkinPreview
                          skinId={skin.id}
                          className="h-8 w-7"
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
      </div>
    </div>
  );
}

function EmptyCategory({ onOpenStore }: { onOpenStore: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e8dcc8] bg-white/60 px-3 py-3 text-center">
      <p className="text-xs text-[#6d655c]">상점에서 아이템을 구매해 보세요.</p>
      <button
        type="button"
        onClick={onOpenStore}
        className="mt-1.5 text-xs font-semibold text-[#6d8a5e] underline-offset-2 hover:underline"
      >
        상점으로
      </button>
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
          className="!rounded-lg shadow-sm"
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
