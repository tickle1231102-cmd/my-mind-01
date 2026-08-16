"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useBgm } from "@/components/BgmProvider";
import { useUiClickSound } from "@/components/UiClickSoundProvider";

const NICKNAME_KEY = "healing-garden-user-nickname";
const POT_NAME_KEY = "healing-garden-pot-name";
const MAX_NAME_LENGTH = 10;

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { enabled: bgmEnabled, toggle: toggleBgm } = useBgm();
  const { enabled: clickSoundEnabled, toggle: toggleClickSound } =
    useUiClickSound();
  const [nickname, setNickname] = useState("");
  const [potName, setPotName] = useState("");
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setNickname(window.localStorage.getItem(NICKNAME_KEY)?.trim() ?? "");
    setPotName(window.localStorage.getItem(POT_NAME_KEY)?.trim() ?? "");
    setHydrated(true);
  }, []);

  function showToast(msg: string) {
    setSavedToast(msg);
    window.setTimeout(() => setSavedToast(null), 1600);
  }

  function persistNickname(value: string) {
    const next = value.trim().slice(0, MAX_NAME_LENGTH);
    const prev = window.localStorage.getItem(NICKNAME_KEY)?.trim() ?? "";
    setNickname(next);
    if (next === prev) return;
    if (next) {
      window.localStorage.setItem(NICKNAME_KEY, next);
    } else {
      window.localStorage.removeItem(NICKNAME_KEY);
    }
    showToast("닉네임을 저장했어요");
  }

  function persistPotName(value: string) {
    const next = value.trim().slice(0, MAX_NAME_LENGTH);
    const prev = window.localStorage.getItem(POT_NAME_KEY)?.trim() ?? "";
    if (!next) {
      showToast("화분 이름을 입력해 주세요");
      return;
    }
    if (next === prev) {
      setPotName(next);
      return;
    }
    setPotName(next);
    window.localStorage.setItem(POT_NAME_KEY, next);
    showToast("화분 이름을 저장했어요");
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

      {savedToast && (
        <div className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4">
          <p className="rounded-full border border-[#9caf88]/40 bg-white/95 px-4 py-2 text-sm font-semibold text-[#6d8a5e] shadow-md backdrop-blur-sm">
            {savedToast}
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
              설정
            </h1>
          </div>
        </header>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#4a5248]">계정</p>
            <p className="mt-1 text-xs leading-relaxed text-[#8ba4b4]">
              로그인하면 레벨·HP·채팅이 클라우드에 저장돼요
            </p>
            {authLoading ? (
              <p className="mt-3 text-sm text-[#8ba4b4]">확인 중…</p>
            ) : user ? (
              <div className="mt-3 space-y-3">
                <p className="truncate rounded-2xl bg-[#f5f0e8] px-3 py-2 text-sm text-[#4a5248]">
                  {user.email ?? user.id}
                </p>
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={async () => {
                    setSigningOut(true);
                    try {
                      await signOut();
                      showToast("로그아웃했어요");
                    } finally {
                      setSigningOut(false);
                    }
                  }}
                  className="w-full rounded-xl border border-[#e8dcc8] bg-white px-4 py-2.5 text-sm font-semibold text-[#4a5248] transition hover:bg-[#FDFBF7] disabled:opacity-50"
                >
                  {signingOut ? "로그아웃 중…" : "로그아웃"}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-[#8fad7a] hover:to-[#6d8a5e]"
              >
                로그인 / 회원가입
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
            <label
              htmlFor="user-nickname"
              className="block text-sm font-semibold text-[#4a5248]"
            >
              유저 닉네임
            </label>
            <p className="mt-1 text-xs leading-relaxed text-[#8ba4b4]">
              정원에서 부를 당신의 이름이에요. 입력을 마치면 자동으로 저장됩니다.
            </p>
            <input
              id="user-nickname"
              type="text"
              value={nickname}
              onChange={(e) =>
                setNickname(e.target.value.slice(0, MAX_NAME_LENGTH))
              }
              onBlur={() => persistNickname(nickname)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="예: 정원사, 마음이"
              disabled={!hydrated}
              className="mt-3 w-full rounded-2xl border border-[#e8e0d4] bg-white px-4 py-3 text-base text-[#4a5248] outline-none transition placeholder:text-[#b5aea3] focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25 disabled:opacity-60"
              autoComplete="off"
            />
            <p className="mt-2 text-[11px] text-[#8ba4b4]">
              {nickname.trim().length}/{MAX_NAME_LENGTH}
            </p>
          </section>

          <section className="rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
            <label
              htmlFor="settings-pot-name"
              className="block text-sm font-semibold text-[#4a5248]"
            >
              주인공 화분 이름
            </label>
            <p className="mt-1 text-xs leading-relaxed text-[#8ba4b4]">
              함께 키우는 새싹의 이름이에요. 입력을 마치면 자동으로 저장됩니다.
            </p>
            <input
              id="settings-pot-name"
              type="text"
              value={potName}
              onChange={(e) =>
                setPotName(e.target.value.slice(0, MAX_NAME_LENGTH))
              }
              onBlur={() => persistPotName(potName)}
              maxLength={MAX_NAME_LENGTH}
              placeholder="예: 몽실이, 햇살"
              disabled={!hydrated}
              className="mt-3 w-full rounded-2xl border border-[#e8e0d4] bg-white px-4 py-3 text-base text-[#4a5248] outline-none transition placeholder:text-[#b5aea3] focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25 disabled:opacity-60"
              autoComplete="off"
            />
            <p className="mt-2 text-[11px] text-[#8ba4b4]">
              {potName.trim().length}/{MAX_NAME_LENGTH}
            </p>
          </section>

          <section className="rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#4a5248]">배경음</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8ba4b4]">
                  {bgmEnabled ? "켜져 있어요" : "꺼져 있어요"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleBgm}
                aria-label={bgmEnabled ? "배경음악 끄기" : "배경음악 켜기"}
                aria-pressed={bgmEnabled}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  bgmEnabled ? "bg-[#9caf88]" : "bg-[#e8e0d4]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                    bgmEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e8e0d4] bg-white/85 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#4a5248]">
                  버튼 터치 효과음
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#8ba4b4]">
                  {clickSoundEnabled
                    ? "버튼을 누를 때 소리가 나요"
                    : "버튼 터치 소리가 꺼져 있어요"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleClickSound}
                aria-label={
                  clickSoundEnabled
                    ? "버튼 터치 효과음 끄기"
                    : "버튼 터치 효과음 켜기"
                }
                aria-pressed={clickSoundEnabled}
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  clickSoundEnabled ? "bg-[#9caf88]" : "bg-[#e8e0d4]"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                    clickSoundEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
