"use client";

import { useEffect, useState } from "react";
import {
  ROOT_GAIN_PER_STEP,
  ROOT_GAIN_PER_SESSION,
  MAX_ROOT_HP,
  applyRootGain,
  getRootMilestoneLabel,
  getRootState,
  saveRootSession,
  type RootState,
} from "@/lib/root-strength";
import { RootCharacter } from "@/components/RootCharacter";

type RootStrengthenModeProps = {
  onClose: () => void;
  onRootStateChange: (state: RootState) => void;
};

type Step = 1 | 2 | "complete";

export function RootStrengthenMode({
  onClose,
  onRootStateChange,
}: RootStrengthenModeProps) {
  const [step, setStep] = useState<Step>(1);
  const [regret, setRegret] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [rootState, setRootState] = useState<RootState>({ level: 0, hp: 0 });
  const [gainFlash, setGainFlash] = useState(false);
  const [lastGain, setLastGain] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  useEffect(() => {
    setRootState(getRootState());
  }, []);

  const rootPercent = Math.round((rootState.hp / MAX_ROOT_HP) * 100);
  const milestone = getRootMilestoneLabel(rootState.level);

  function handleStep1Next() {
    if (!regret.trim()) return;
    const { state: next } = applyRootGain(ROOT_GAIN_PER_STEP);
    setRootState(next);
    onRootStateChange(next);
    setLastGain(ROOT_GAIN_PER_STEP);
    setGainFlash(true);
    window.setTimeout(() => setGainFlash(false), 900);
    setStep(2);
  }

  function handleComplete() {
    if (!gratitude.trim()) return;

    saveRootSession(regret, gratitude);
    const beforeLevel = rootState.level;
    const { state: next, leveledUp: didLevelUp } = applyRootGain(ROOT_GAIN_PER_STEP);

    setRootState(next);
    onRootStateChange(next);
    setLastGain(ROOT_GAIN_PER_STEP);
    setLeveledUp(didLevelUp || next.level > beforeLevel);
    setGainFlash(true);
    setStep("complete");

    window.setTimeout(() => setGainFlash(false), 1200);
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#FDFBF7]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e8e0d4]/80 via-[#d9cfc0]/60 to-[#b8a894]/70" aria-hidden />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-6 sm:py-8">
      {/* 상단: 헤더 */}
      <header className="relative z-10 flex shrink-0 items-center justify-between pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="뿌리 강화 모드 닫기"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9bfb0] bg-white/70 text-[#4a5248] shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6d8a5e]">
            ROOT MODE
          </p>
          <h2 className="text-lg font-bold text-[#3d352c]">뿌리 강화</h2>
        </div>
        <div className="w-10" aria-hidden />
      </header>

      {/* 뿌리 시각화 영역 */}
      <section className="relative shrink-0 overflow-hidden rounded-2xl border border-[#c9bfb0]/80 bg-gradient-to-b from-[#f5f0e8] to-[#e0d4c4] shadow-inner">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="root-rain absolute left-[18%] top-2 h-3 w-0.5 rounded-full bg-[#8ba4b4]/60" />
          <span className="root-rain root-rain-delay absolute left-[42%] top-0 h-4 w-0.5 rounded-full bg-[#8ba4b4]/50" />
          <span className="root-rain root-rain-delay-2 absolute left-[68%] top-1 h-3 w-0.5 rounded-full bg-[#8ba4b4]/55" />
          <span className="root-rain absolute left-[82%] top-3 h-2.5 w-0.5 rounded-full bg-[#8ba4b4]/45" />
        </div>

        <div className="relative px-4 pb-3 pt-4">
          <p className="text-center text-xs text-[#6d655c]">
            비가 내려도 뿌리는 더 단단해져요
          </p>

          <div className="relative mx-auto mt-2">
            <RootCharacter
              level={rootState.level}
              hpPercent={rootPercent}
              growing={gainFlash}
            />
          </div>

          {/* 뿌리 레벨 */}
          <div className="mt-2 rounded-xl border border-[#c9bfb0]/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#5a6b4a]">뿌리 강도</span>
              <span className="tabular-nums font-medium text-[#4a5248]">
                {rootState.hp} / {MAX_ROOT_HP}
                <span className="ml-1 text-[#8ba4b4]">({rootPercent}%)</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#d9cfc0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7a9168] to-[#5a6b4a] transition-all duration-700"
                style={{ width: `${rootPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#6d655c]">
              <span>
                Root Lv.{rootState.level} · {milestone}
              </span>
              {gainFlash && (
                <span className="root-gain-pop font-semibold text-[#6d8a5e]">
                  +{lastGain}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 단계별 입력 */}
      <main className="mt-4 flex min-h-0 flex-1 flex-col">
        {step !== "complete" ? (
          <>
            <div className="mb-4 flex items-center gap-2">
              {[1, 2].map((n) => (
                <div key={n} className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step === n
                        ? "bg-[#6d8a5e] text-white"
                        : step > n
                          ? "bg-[#9caf88]/40 text-[#3d5235]"
                          : "bg-white/60 text-[#8ba4b4]"
                    }`}
                  >
                    {n}
                  </span>
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      step > n ? "bg-[#9caf88]/50" : "bg-white/40"
                    }`}
                  />
                </div>
              ))}
            </div>

            {step === 1 ? (
              <div className="flex flex-1 flex-col">
                <label
                  htmlFor="root-regret"
                  className="text-sm font-semibold leading-relaxed text-[#3d352c]"
                >
                  1단계 · 오늘 있었던 아쉬운 일 한 줄
                </label>
                <p className="mt-1 text-xs leading-relaxed text-[#6d655c]">
                  힘들었던 순간을 내려놓으면, 뿌리가 그 아래로 내려가요.
                </p>
                <textarea
                  id="root-regret"
                  value={regret}
                  onChange={(e) => setRegret(e.target.value)}
                  placeholder="예: 발표에서 말을 더듬어서 아쉬웠다"
                  rows={4}
                  className="mt-3 flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white/80 px-4 py-3 text-base text-[#3d352c] outline-none transition placeholder:text-[#b5aea3] focus:border-[#6d8a5e] focus:ring-2 focus:ring-[#6d8a5e]/20"
                />
                <p className="mt-2 text-[11px] text-[#8ba4b4]">
                  완료 시 뿌리 +{ROOT_GAIN_PER_STEP}
                </p>
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={!regret.trim()}
                  className="mt-4 shrink-0 rounded-2xl bg-gradient-to-b from-[#8ba4b4] to-[#6d8a8a] px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-[#7a94a4] hover:to-[#5d7a7a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음 — 감사·배움 적기
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <label
                  htmlFor="root-gratitude"
                  className="text-sm font-semibold leading-relaxed text-[#3d352c]"
                >
                  2단계 · 그럼에도 감사하거나 배운 점 한 줄
                </label>
                <p className="mt-1 text-xs leading-relaxed text-[#6d655c]">
                  비가 내린 뒤 뿌리가 단단해지듯, 아쉬움 속에서도 자란 마음을 적어요.
                </p>
                <div className="mt-2 rounded-xl border border-[#c9bfb0]/60 bg-white/40 px-3 py-2 text-xs text-[#6d655c]">
                  <span className="font-medium text-[#5a6b4a]">아쉬웠던 일</span>
                  <p className="mt-0.5 line-clamp-2">{regret.trim()}</p>
                </div>
                <textarea
                  id="root-gratitude"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="예: 그래도 용기 내서 끝까지 말했고, 다음엔 연습하겠다"
                  rows={4}
                  className="mt-3 flex-1 resize-none rounded-2xl border border-[#c9bfb0] bg-white/80 px-4 py-3 text-base text-[#3d352c] outline-none transition placeholder:text-[#b5aea3] focus:border-[#6d8a5e] focus:ring-2 focus:ring-[#6d8a5e]/20"
                />
                <p className="mt-2 text-[11px] text-[#8ba4b4]">
                  완료 시 뿌리 +{ROOT_GAIN_PER_STEP} (총 +{ROOT_GAIN_PER_SESSION})
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="shrink-0 rounded-2xl border border-[#c9bfb0] bg-white/70 px-4 py-3.5 text-sm font-medium text-[#4a5248] transition hover:bg-white"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={!gratitude.trim()}
                    className="min-w-0 flex-1 rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#6d8a5e] px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#5a7a4e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    뿌리를 단단히 하기
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="root-gain-pop mb-3 w-full max-w-[180px]" aria-hidden>
              <RootCharacter
                level={rootState.level}
                hpPercent={rootPercent}
                growing={leveledUp || gainFlash}
              />
            </div>
            <h3 className="text-lg font-bold text-[#3d352c]">
              {leveledUp ? "뿌리 레벨 업!" : "뿌리가 더 깊어졌어요"}
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6d655c]">
              아쉬움을 받아들이고, 그 안에서 배운 마음이 뿌리를 단단하게 했어요.
              <br />
              <span className="font-semibold text-[#6d8a5e]">
                +{ROOT_GAIN_PER_SESSION} 뿌리 강도
              </span>
              {leveledUp && (
                <>
                  <br />
                  <span className="font-semibold text-[#6d8a5e]">
                    Root Lv.{rootState.level} 달성!
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#6d8a5e] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#5a7a4e] active:scale-[0.98]"
            >
              화분으로 돌아가기
            </button>
          </div>
        )}
      </main>

      <footer className="shrink-0 pt-2 text-center text-[10px] text-[#8ba4b4]">
        뿌리가 강할수록 시련의 바람에도 덜 흔들려요
      </footer>
      </div>
    </div>
  );
}
