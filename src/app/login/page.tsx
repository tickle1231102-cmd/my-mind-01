"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("error") === "auth_callback"
      ? "로그인 연결에 실패했어요. 다시 시도해 주세요."
      : null,
  );

  async function handleEmailAuth(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/");
          router.refresh();
          return;
        }
        setMessage(
          "가입 요청을 보냈어요. 이메일 확인이 켜져 있으면 메일함의 링크를 눌러 주세요. 바로 로그인도 시도해 보세요.",
        );
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.replace("/");
        router.refresh();
      }
    } catch (err) {
      const text =
        err instanceof Error ? err.message : "인증에 실패했어요.";
      setMessage(friendlyAuthError(text));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setMessage(friendlyAuthError(error.message));
      setBusy(false);
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

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-6 sm:py-8">
        <header className="mb-6 flex items-center gap-3">
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
              {mode === "login" ? "로그인" : "회원가입"}
            </h1>
          </div>
        </header>

        <div className="rounded-3xl border border-[#e8e0d4] bg-white/90 p-5 shadow-md backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-[#6d8a5e]">
            로그인하면 레벨·HP·채팅이 계정에 저장되어, 다른 기기에서도 이어서
            플레이할 수 있어요.
          </p>

          <div className="mt-4 flex rounded-2xl bg-[#f5f0e8] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-[#4a5248] shadow-sm"
                  : "text-[#8ba4b4]"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-[#4a5248] shadow-sm"
                  : "text-[#8ba4b4]"
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-[#8ba4b4]">
                이메일
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#e8e0d4] bg-[#FDFBF7] px-4 py-3 text-sm text-[#4a5248] outline-none transition focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25"
                placeholder="you@email.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#8ba4b4]">
                비밀번호
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-[#e8e0d4] bg-[#FDFBF7] px-4 py-3 text-sm text-[#4a5248] outline-none transition focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25"
                placeholder="6자 이상"
              />
            </label>

            {message && (
              <p className="rounded-2xl bg-[#e8a598]/15 px-3 py-2 text-xs leading-relaxed text-[#5a4038]">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] py-3 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-[0.99] disabled:opacity-50"
            >
              {busy
                ? "잠시만요…"
                : mode === "login"
                  ? "이메일로 로그인"
                  : "이메일로 가입"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e8e0d4]" />
            <span className="text-[11px] text-[#8ba4b4]">또는</span>
            <div className="h-px flex-1 bg-[#e8e0d4]" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e8e0d4] bg-white py-3 text-sm font-semibold text-[#4a5248] shadow-sm transition hover:bg-[#FDFBF7] active:scale-[0.99] disabled:opacity-50"
          >
            <span aria-hidden>G</span>
            Google로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

function friendlyAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login")) {
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  }
  if (lower.includes("already registered") || lower.includes("already been")) {
    return "이미 가입된 이메일이에요. 로그인으로 시도해 주세요.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Google 로그인이 아직 활성화되지 않았어요. Supabase Dashboard에서 Google provider를 확인해 주세요.";
  }
  if (lower.includes("password")) {
    return "비밀번호는 6자 이상이어야 해요.";
  }
  return raw;
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#FDFBF7] text-sm text-[#8ba4b4]">
          불러오는 중…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
