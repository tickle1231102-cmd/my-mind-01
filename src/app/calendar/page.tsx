"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatDateKey,
  formatKoreanDate,
  getDatesWithMessages,
  getDayMessages,
  isToday,
  parseDateKey,
  type StoredMessage,
} from "@/lib/chat-history";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function ChatBubble({ msg }: { msg: StoredMessage }) {
  return (
    <div
      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
    >
      <p
        className={`max-w-[90%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed sm:max-w-[80%] sm:text-sm ${
          msg.from === "bot"
            ? "rounded-bl-md bg-[#f0ebe3] text-[#4a5248]"
            : msg.tone === "positive"
              ? "rounded-br-md bg-[#9caf88]/25 text-[#3d5235]"
              : msg.tone === "negative"
                ? "rounded-br-md bg-[#a3bcc9]/30 text-[#3a4a52]"
                : "rounded-br-md bg-[#e8e0d4]/70 text-[#4a5248]"
        }`}
      >
        {msg.text}
      </p>
    </div>
  );
}

export default function CalendarPage() {
  const today = new Date();
  const todayKey = formatDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [datesWithMessages, setDatesWithMessages] = useState<Set<string>>(
    new Set(),
  );
  const [selectedMessages, setSelectedMessages] = useState<StoredMessage[]>(
    [],
  );

  const cells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  useEffect(() => {
    setDatesWithMessages(getDatesWithMessages());
  }, []);

  useEffect(() => {
    if (!selectedDateKey || isToday(selectedDateKey)) {
      setSelectedMessages([]);
      return;
    }
    setSelectedMessages(getDayMessages(selectedDateKey));
    setDatesWithMessages(getDatesWithMessages());
  }, [selectedDateKey]);

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDateKey(null);
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDateKey(null);
  }

  function handleDateClick(day: number) {
    const dateKey = formatDateKey(new Date(viewYear, viewMonth, day));
    if (isToday(dateKey)) {
      setSelectedDateKey(null);
      return;
    }
    setSelectedDateKey(dateKey);
  }

  const showHistoryPanel =
    selectedDateKey !== null && !isToday(selectedDateKey);
  const userMessageCount = selectedMessages.filter(
    (m) => m.from === "user",
  ).length;

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
        <header className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dcc8] bg-white/90 text-lg text-[#4a5248] shadow-sm transition hover:bg-white"
            aria-label="메인으로 돌아가기"
          >
            ←
          </Link>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8ba4b4]">
              HEALING GARDEN
            </p>
            <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">
              마음 달력
            </h1>
          </div>
        </header>

        <section className="rounded-3xl border border-[#e8e0d4] bg-white/85 p-4 shadow-md backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#FDFBF7] text-[#4a5248] transition hover:border-[#9caf88] active:scale-95"
              aria-label="이전 달"
            >
              ‹
            </button>
            <p className="text-base font-bold text-[#4a5248] sm:text-lg">
              {viewYear}년 {viewMonth + 1}월
            </p>
            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#FDFBF7] text-[#4a5248] transition hover:border-[#9caf88] active:scale-95"
              aria-label="다음 달"
            >
              ›
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((label, i) => (
              <span
                key={label}
                className={`py-1 text-xs font-semibold ${
                  i === 0
                    ? "text-[#e8a598]"
                    : i === 6
                      ? "text-[#8ba4b4]"
                      : "text-[#8ba4b4]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateKey = formatDateKey(
                new Date(viewYear, viewMonth, day),
              );
              const isTodayDate = dateKey === todayKey;
              const isSelected = selectedDateKey === dateKey;
              const hasLog = datesWithMessages.has(dateKey);
              const isFuture =
                parseDateKey(dateKey) > parseDateKey(todayKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isFuture}
                  onClick={() => handleDateClick(day)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                    isTodayDate
                      ? "border-2 border-[#9caf88] bg-[#9caf88]/20 text-[#3d5235] shadow-sm"
                      : isSelected
                        ? "border-2 border-[#e8a598] bg-[#e8a598]/20 text-[#4a5248]"
                        : hasLog
                          ? "border border-[#e8dcc8] bg-[#FDFBF7] text-[#4a5248] hover:border-[#9caf88]/60 hover:bg-[#9caf88]/10"
                          : "border border-transparent text-[#4a5248] hover:bg-[#f5f0e8]"
                  }`}
                  aria-label={`${day}일${isTodayDate ? " 오늘" : ""}${hasLog ? " 대화 기록 있음" : ""}`}
                  aria-pressed={isSelected}
                >
                  {day}
                  {hasLog && !isTodayDate && (
                    <span
                      className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#9caf88]"
                      aria-hidden
                    />
                  )}
                  {isTodayDate && (
                    <span className="mt-0.5 text-[9px] font-semibold text-[#6d8a5e]">
                      오늘
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-[#8ba4b4]">
            오늘은 메인 화면에서 대화해요 · 다른 날짜를 누르면 기록을 볼 수
            있어요
          </p>
        </section>

        {showHistoryPanel && selectedDateKey && (
          <section className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white/90 shadow-lg backdrop-blur-md">
            <div className="border-b border-[#ede8df] bg-gradient-to-r from-[#f5f0e8]/80 to-white/60 px-4 py-3">
              <p className="text-sm font-semibold text-[#4a5248]">
                {formatKoreanDate(selectedDateKey)}
              </p>
              <p className="mt-0.5 text-xs text-[#8ba4b4]">
                {userMessageCount > 0
                  ? `그날 나눈 대화 ${userMessageCount}개`
                  : "이 날은 대화 기록이 없어요"}
              </p>
            </div>

            <div className="flex max-h-64 min-h-36 flex-col gap-2 overflow-y-auto px-3 py-3 sm:max-h-80">
              {userMessageCount === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                  <span className="text-3xl" aria-hidden>
                    🍃
                  </span>
                  <p className="text-sm text-[#8ba4b4]">
                    이 날은 아직 마음을 적지 않았어요
                  </p>
                </div>
              ) : (
                selectedMessages.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} />
                ))
              )}
            </div>
          </section>
        )}

        {!showHistoryPanel && (
          <div className="mt-6 rounded-2xl border border-dashed border-[#e8dcc8] bg-white/50 px-4 py-5 text-center">
            <p className="text-sm text-[#8ba4b4]">
              과거 날짜를 선택하면 그날의 채팅 기록이 여기에 표시돼요
            </p>
            <Link
              href="/"
              className="mt-3 inline-block rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-95"
            >
              오늘 대화하러 가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
