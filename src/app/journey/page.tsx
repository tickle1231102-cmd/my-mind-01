"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { JourneyMap } from "@/components/JourneyMap";
import { PotionBadge } from "@/components/PotionBadge";
import { PotionIcon } from "@/components/PotionIcon";
import {
  ALL_CLEAR_BONUS,
  DAILY_QUESTS,
  getTodayQuestProgress,
  type DailyQuestId,
  type DailyQuestProgress,
} from "@/lib/daily-quests";
import {
  buildMilestonesForRealm,
  claimMilestoneReward,
  getClaimedMilestoneIds,
  getSessionById,
  isUndergroundUnlocked,
  REALM_LABELS,
  SURFACE_TERRAIN_ORDER,
  UNDERGROUND_TERRAIN_ORDER,
  type JourneyMilestone,
  type JourneyRealm,
} from "@/lib/journey";
import { getPotionBalance } from "@/lib/potion";
import {
  getRootMilestoneLabel,
  getRootState,
  type RootSessionEntry,
  type RootState,
} from "@/lib/root-strength";

const QUEST_ICONS: Record<DailyQuestId, string> = {
  chat: "💬",
  water: "💧",
  root: "🌿",
};

export default function JourneyPage() {
  const [realm, setRealm] = useState<JourneyRealm>("surface");
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [potionBalance, setPotionBalance] = useState(0);
  const [selected, setSelected] = useState<JourneyMilestone | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<RootSessionEntry | null>(
    null,
  );
  const [claimFx, setClaimFx] = useState<string | null>(null);
  const [questProgress, setQuestProgress] = useState<DailyQuestProgress | null>(
    null,
  );
  const [undergroundUnlocked, setUndergroundUnlocked] = useState(false);
  const [rootState, setRootState] = useState<RootState>({ level: 0, hp: 0 });
  const [showLockGuide, setShowLockGuide] = useState(false);

  function refresh(activeRealm: JourneyRealm = realm) {
    setMilestones(buildMilestonesForRealm(activeRealm));
    setClaimedIds(getClaimedMilestoneIds());
    setPotionBalance(getPotionBalance());
    setQuestProgress(getTodayQuestProgress());
    setUndergroundUnlocked(isUndergroundUnlocked());
    setRootState(getRootState());
  }

  useEffect(() => {
    refresh("surface");

    function onFocus() {
      refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  useEffect(() => {
    setMilestones(buildMilestonesForRealm(realm));
    setSelected(null);
    setSelectedMemory(null);
  }, [realm]);

  const nextTargetId = useMemo(() => {
    return milestones.find((m) => !m.achieved)?.id ?? null;
  }, [milestones]);

  const achievedCount = milestones.filter((m) => m.achieved).length;
  const currentStage = useMemo(() => {
    const focus =
      milestones.find((m) => !m.achieved) ??
      milestones[milestones.length - 1];
    if (!focus) return 1;

    if (realm === "underground") {
      const idx = UNDERGROUND_TERRAIN_ORDER.indexOf(
        focus.terrain as (typeof UNDERGROUND_TERRAIN_ORDER)[number],
      );
      return idx >= 0 ? idx + 1 : 1;
    }

    const idx = SURFACE_TERRAIN_ORDER.indexOf(
      focus.terrain as (typeof SURFACE_TERRAIN_ORDER)[number],
    );
    return idx >= 0 ? idx + 1 : 1;
  }, [milestones, realm]);
  const questDoneCount = questProgress
    ? DAILY_QUESTS.filter((q) => questProgress.completed[q.id]).length
    : 0;
  const allQuestsDone = questDoneCount === DAILY_QUESTS.length;
  const isUnderground = realm === "underground";

  function switchRealm(next: JourneyRealm) {
    if (next === "underground" && !undergroundUnlocked) {
      setShowLockGuide(true);
      return;
    }
    setShowLockGuide(false);
    setRealm(next);
  }

  function openMilestone(milestone: JourneyMilestone) {
    setSelected(milestone);
    if (milestone.achieved && milestone.memorySessionId) {
      setSelectedMemory(getSessionById(milestone.memorySessionId));
    } else {
      setSelectedMemory(null);
    }
  }

  function handleClaim(milestone: JourneyMilestone) {
    if (!milestone.achieved || milestone.potionReward <= 0) return;
    if (claimedIds.has(milestone.id)) return;

    const result = claimMilestoneReward(milestone.id, milestone.potionReward);
    if (result.claimed) {
      setClaimedIds((prev) => {
        const next = new Set(prev);
        next.add(milestone.id);
        return next;
      });
      setPotionBalance(result.balance);
      setClaimFx(`+${milestone.potionReward}`);
      window.setTimeout(() => setClaimFx(null), 1400);
    }
  }

  return (
    <div
      className={`relative flex h-dvh max-h-dvh flex-col overflow-hidden transition-colors duration-500 ${
        isUnderground ? "bg-[#f3eee6]" : "bg-[#FDFBF7]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {isUnderground ? (
          <>
            <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#c4b49a]/25 blur-3xl" />
            <div className="absolute -right-20 top-1/3 h-56 w-56 rounded-full bg-[#9a8b74]/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#8a7355]/15 blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#9caf88]/14 blur-3xl" />
            <div className="absolute -right-16 top-1/4 h-52 w-52 rounded-full bg-[#a3bcc9]/20 blur-3xl" />
            <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#e8a598]/12 blur-3xl" />
          </>
        )}
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-6 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pt-8">
        <header className="mb-4 flex shrink-0 items-center gap-3">
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
            <h1 className="truncate text-xl font-bold text-[#4a5248] sm:text-2xl">
              {isUnderground ? "뿌리의 여정길" : "마음의 여정길"}
            </h1>
          </div>
          <PotionBadge href="/journey" />
        </header>

        {!undergroundUnlocked && !isUnderground && (
          <div className="mb-4 shrink-0 rounded-2xl border border-[#d9cfc0] bg-[#efe8dc]/90 px-4 py-3">
            <p className="text-sm font-semibold text-[#5a4d3d]">
              지하 여정은 아직 잠겨 있어요
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8a7355]">
              메인 화면에서 뿌리 강화를 한 번 시작하면, 후회를 감사로 바꾸는
              지하 여정길이 열려요.
            </p>
            <Link
              href="/"
              className="mt-3 inline-flex items-center rounded-xl bg-[#8a7355] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#7a6548] active:scale-95"
            >
              뿌리 강화 시작하기
            </Link>
          </div>
        )}

        {isUnderground && (
          <div className="mb-4 flex shrink-0 items-center justify-between rounded-2xl border border-[#d9cfc0] bg-[#efe8dc]/90 px-4 py-2.5">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-[#8a7355]">
                ROOT LEVEL
              </p>
              <p className="text-sm font-bold text-[#4a5248]">
                Lv.{rootState.level} · {getRootMilestoneLabel(rootState.level)}
              </p>
            </div>
            <Link
              href="/?openRoot=1"
              className="rounded-xl bg-[#8a7355] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#7a6548] active:scale-95"
            >
              뿌리 강화
            </Link>
          </div>
        )}

        {!isUnderground && (
          <section className="mb-4 shrink-0 rounded-3xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#8ba4b4]">
                  TODAY
                </p>
                <h2 className="text-base font-bold text-[#4a5248]">
                  오늘의 여정
                </h2>
              </div>
              <p className="shrink-0 text-xs font-semibold text-[#6d8a5e]">
                {questDoneCount}/{DAILY_QUESTS.length}
              </p>
            </div>

            <ul className="space-y-2">
              {DAILY_QUESTS.map((quest) => {
                const done = Boolean(questProgress?.completed[quest.id]);
                return (
                  <li key={quest.id}>
                    <Link
                      href="/"
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition active:scale-[0.99] ${
                        done
                          ? "border-[#9caf88]/50 bg-[#9caf88]/10"
                          : "border-[#e8dcc8] bg-[#FDFBF7] hover:border-[#9caf88]/50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${
                          done
                            ? "bg-gradient-to-b from-[#9caf88] to-[#7a9168] text-white"
                            : "bg-[#ede8df]"
                        }`}
                        aria-hidden
                      >
                        {done ? "✓" : QUEST_ICONS[quest.id]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-semibold ${
                            done
                              ? "text-[#6d8a5e] line-through"
                              : "text-[#4a5248]"
                          }`}
                        >
                          {quest.title}
                        </span>
                        <span className="block text-[11px] text-[#8ba4b4]">
                          {quest.description}
                        </span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#c98fd6]">
                        <PotionIcon className="h-3.5 w-3.5" />+
                        {quest.potionReward}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div
              className={`mt-3 flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs ${
                allQuestsDone
                  ? "bg-gradient-to-r from-[#9caf88]/25 to-[#e8a598]/20 text-[#3d5235]"
                  : "bg-[#f5f0e8] text-[#8ba4b4]"
              }`}
            >
              <span className="font-medium">
                {allQuestsDone
                  ? "오늘 여정을 모두 마쳤어요!"
                  : "세 가지를 모두 끝내면 보너스"}
              </span>
              <span className="inline-flex items-center gap-0.5 font-bold text-[#c98fd6]">
                <PotionIcon className="h-3.5 w-3.5" />+{ALL_CLEAR_BONUS}
              </span>
            </div>
          </section>
        )}

        <div
          className={`mb-3 flex shrink-0 items-center justify-between rounded-2xl border px-4 py-2.5 ${
            isUnderground
              ? "border-[#d9cfc0] bg-[#efe8dc]/80"
              : "border-[#e8dcc8] bg-white/70"
          }`}
        >
          <p
            className={`text-xs font-semibold tracking-wide ${
              isUnderground ? "text-[#8a7355]" : "text-[#6d8a5e]"
            }`}
          >
            Stage {currentStage}
          </p>
          <p
            className={`shrink-0 text-xs font-semibold ${
              isUnderground ? "text-[#8a7355]" : "text-[#6d8a5e]"
            }`}
          >
            {achievedCount}/{milestones.length}
          </p>
        </div>

        <JourneyMap
          milestones={milestones}
          realm={realm}
          claimedIds={claimedIds}
          nextTargetId={nextTargetId}
          onSelect={openMilestone}
        />
      </div>

      {/* 지상 / 지하 토글 — 화면 하단 고정 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-md sm:max-w-lg">
          <div
            role="tablist"
            aria-label="여정 세계 선택"
            className={`grid grid-cols-2 gap-1 rounded-2xl border p-1 shadow-lg backdrop-blur-sm ${
              isUnderground
                ? "border-[#d9cfc0] bg-[#f3eee6]/95"
                : "border-[#e8dcc8] bg-white/95"
            }`}
          >
            {(["surface", "underground"] as const).map((id) => {
              const locked = id === "underground" && !undergroundUnlocked;
              const active = realm === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-disabled={locked}
                  onClick={() => switchRealm(id)}
                  className={`relative rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                    active
                      ? isUnderground
                        ? "bg-[#8a7355] text-white shadow-sm"
                        : "bg-[#6d8a5e] text-white shadow-sm"
                      : "text-[#6d655c] hover:bg-[#f5f0e8]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {id === "surface" ? (
                      <span aria-hidden>🌱</span>
                    ) : (
                      <span aria-hidden>{locked ? "🔒" : "🌿"}</span>
                    )}
                    {REALM_LABELS[id]}
                  </span>
                  {locked && (
                    <span className="mt-0.5 block text-[10px] font-medium opacity-80">
                      뿌리 강화 후 열림
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#4a5248]/30 backdrop-blur-sm sm:items-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0"
            onClick={() => {
              setSelected(null);
              setSelectedMemory(null);
            }}
          />
          <div className="relative z-10 max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-t-3xl border border-[#e8e0d4] bg-[#FDFBF7] p-6 shadow-xl sm:rounded-3xl">
            <span
              className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                selected.achieved
                  ? isUnderground
                    ? "bg-gradient-to-b from-[#a89880] to-[#8a7355] text-white"
                    : "bg-gradient-to-b from-[#9caf88] to-[#7a9168] text-white"
                  : "bg-[#ede8df] text-[#b8b2a6]"
              }`}
              aria-hidden
            >
              {selected.achieved ? (isUnderground ? "🌿" : "🌱") : "🔒"}
            </span>
            <h2 className="text-lg font-bold text-[#4a5248]">
              {selected.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d655c]">
              {selected.achieved
                ? selected.description
                : isUnderground
                  ? "아직 닿지 않은 이정표예요. 뿌리 강화로 더 깊이 내려가 보세요."
                  : "아직 도달하지 않은 이정표예요. 씨앗을 계속 돌봐주세요."}
            </p>

            {selected.achieved && selectedMemory && (
              <div className="mt-4 space-y-2 rounded-2xl border border-[#e8dcc8] bg-white/80 p-3">
                <p className="text-[11px] font-semibold tracking-wide text-[#8a7355]">
                  그날의 기억
                </p>
                <div>
                  <p className="text-[11px] font-medium text-[#8ba4b4]">후회</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#4a5248]">
                    {selectedMemory.regret}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-[#8ba4b4]">감사</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#4a5248]">
                    {selectedMemory.gratitude}
                  </p>
                </div>
              </div>
            )}

            {selected.achieved && selected.potionReward > 0 && (
              <button
                type="button"
                onClick={() => handleClaim(selected)}
                disabled={claimedIds.has(selected.id)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:from-[#cfd6c8] disabled:to-[#cfd6c8] ${
                  isUnderground
                    ? "bg-gradient-to-b from-[#a89880] to-[#8a7355] hover:from-[#9a8b74] hover:to-[#7a6548]"
                    : "bg-gradient-to-b from-[#9caf88] to-[#7a9168] hover:from-[#8fad7a] hover:to-[#6d8a5e]"
                }`}
              >
                <PotionIcon className="h-4 w-4" />
                {claimedIds.has(selected.id)
                  ? "포션 획득 완료"
                  : `포션 ${selected.potionReward}개 받기`}
              </button>
            )}

            {!selected.achieved && isUnderground && (
              <Link
                href="/?openRoot=1"
                onClick={() => {
                  setSelected(null);
                  setSelectedMemory(null);
                }}
                className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#a89880] to-[#8a7355] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#9a8b74] hover:to-[#7a6548] active:scale-[0.98]"
              >
                뿌리 강화하러 가기
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setSelectedMemory(null);
              }}
              className="mt-2 w-full rounded-2xl border border-[#e8dcc8] bg-white/80 px-4 py-3 text-sm font-medium text-[#6d655c] transition hover:bg-white active:scale-[0.98]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {showLockGuide && !undergroundUnlocked && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#4a5248]/30 backdrop-blur-sm sm:items-center">
          <button
            type="button"
            aria-label="닫기"
            className="absolute inset-0"
            onClick={() => setShowLockGuide(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-t-3xl border border-[#d9cfc0] bg-[#f3eee6] p-6 shadow-xl sm:rounded-3xl">
            <span
              className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8dfd0] text-xl"
              aria-hidden
            >
              🌿
            </span>
            <h2 className="text-lg font-bold text-[#4a5248]">
              지하 여정은 뿌리가 필요해요
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5c4a]">
              씨앗이 위로 자라듯, 마음도 아래로 뿌리를 내릴 수 있어요. 뿌리
              강화를 한 번 시작하면 후회와 감사가 쌓인 지하 여정길이 열립니다.
            </p>
            <Link
              href="/"
              onClick={() => setShowLockGuide(false)}
              className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#a89880] to-[#8a7355] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#9a8b74] hover:to-[#7a6548] active:scale-[0.98]"
            >
              뿌리 강화하러 가기
            </Link>
            <button
              type="button"
              onClick={() => setShowLockGuide(false)}
              className="mt-2 w-full rounded-2xl border border-[#d9cfc0] bg-white/80 px-4 py-3 text-sm font-medium text-[#6d655c] transition hover:bg-white active:scale-[0.98]"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {claimFx && (
        <div className="pointer-events-none fixed left-1/2 top-1/4 z-[60] -translate-x-1/2 animate-bounce rounded-full bg-[#4a5248]/85 px-4 py-2 text-sm font-bold text-white shadow-lg">
          <PotionIcon className="mr-1 inline-block h-4 w-4 text-[#e8c9ee]" />
          {claimFx} 포션
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        포션 {potionBalance}개
      </span>
    </div>
  );
}
