"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MoodBlob } from "@/components/MoodBlob";
import {
  formatDateKey,
  getMoodsForMonth,
  MOOD_LABELS,
  type MoodKind,
} from "@/lib/mood-log";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date | null; dateKey: string | null }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ date: null, dateKey: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, dateKey: formatDateKey(date) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, dateKey: null });
  }

  return cells;
}

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [monthMoods, setMonthMoods] = useState<Record<string, MoodKind>>({});
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayKey = formatDateKey(new Date());

  const monthLabel = `${month + 1}월`;
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  useEffect(() => {
    setMonthMoods(getMoodsForMonth(year, month));
  }, [year, month]);

  useEffect(() => {
    const refresh = () => setMonthMoods(getMoodsForMonth(year, month));
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [year, month]);

  const selectedMood = selectedDateKey ? monthMoods[selectedDateKey] : null;

  function goToPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDateKey(null);
  }

  function goToNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDateKey(null);
  }

  function goToToday() {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(formatDateKey(now));
  }

  return (
    <div className="min-h-dvh bg-[#121212] text-white">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:max-w-lg">
        <header className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            aria-label="홈으로 돌아가기"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#242424] text-white transition hover:bg-[#2f2f2f]"
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
          </Link>

          <div className="flex flex-1 items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              aria-label="이전 달"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424] text-white transition hover:bg-[#2f2f2f]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <path
                  d="M15 6 9 12l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="rounded-full bg-[#242424] px-4 py-2 text-lg font-semibold">
              {monthLabel}
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              aria-label="다음 달"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#242424] text-white transition hover:bg-[#2f2f2f]"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="mb-3 grid grid-cols-7 gap-1 text-center text-sm text-[#8d8d8d]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 gap-x-1 gap-y-3">
          {cells.map((cell, index) => {
            if (!cell.date || !cell.dateKey) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const mood = monthMoods[cell.dateKey];
            const isToday = cell.dateKey === todayKey;
            const isSelected = cell.dateKey === selectedDateKey;
            const dayNumber = cell.date.getDate();

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(cell.dateKey)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl transition ${
                  isSelected ? "bg-[#242424]" : "hover:bg-[#1d1d1d]"
                }`}
              >
                {mood ? (
                  <MoodBlob mood={mood} size={46} />
                ) : (
                  <span
                    className={`text-lg font-medium ${
                      isToday ? "text-white" : "text-[#d0d0d0]"
                    }`}
                  >
                    {dayNumber}
                  </span>
                )}
                {isToday && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white/80" />
                )}
              </button>
            );
          })}
        </div>

        {selectedDateKey && selectedMood && (
          <div className="mt-4 rounded-2xl bg-[#242424] px-4 py-3 text-center text-sm text-[#d7d7d7]">
            <span className="font-semibold text-white">{selectedDateKey}</span>
            <span className="mx-2 text-[#666]">·</span>
            {MOOD_LABELS[selectedMood]}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-full bg-[#242424] px-5 py-2 text-sm font-medium text-[#ececec] transition hover:bg-[#2f2f2f]"
          >
            오늘
          </button>
        </div>

        <Link
          href="/"
          aria-label="채팅으로 이동"
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#121212] shadow-lg transition hover:scale-105 active:scale-95 sm:right-[calc(50%-14rem)]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M4 20l2.5-6.2L18 4.5 19.5 6 8.7 16.8 4 20Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="m13.5 7.5 3 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
