"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDateKey, saveDayMessages } from "@/lib/chat-history";
import { getFallbackReply } from "@/lib/healing-bot";
import { recordMoodEntry } from "@/lib/mood-log";
import { detectSentiment, type Sentiment } from "@/lib/sentiment";

const MAX_HP = 100;
const HP_GAIN = 15;
const HP_LOSS = 18;
const HP_POT_GAIN = 5;
const LEVEL_UP_THRESHOLD = MAX_HP;

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
  tone?: Sentiment;
};

type PlantFx = "float" | "shake" | "bloom" | "wilt";

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSproutSrc(level: number): string | null {
  if (level <= 0) return null;
  const stage = Math.min(level, 5);
  return `/sprouts/sprout0${stage}.png`;
}

const SEED_SIZE = 1024;

function getPlantStatus(
  hp: number,
  level: number,
  wiltedByNegative: boolean,
): string {
  if (hp === 0 && wiltedByNegative) {
    return "씨앗이 잠들었어요… 긍정의 말로 다시 깨워 주세요";
  }

  if (level === 0) {
    if (wiltedByNegative && hp <= 25) {
      return "마음이 무거워요… 따뜻한 말이 필요해요";
    }
    if (hp === 0) {
      return "반짝이는 씨앗이 당신을 기다리고 있어요";
    }
    return "씨앗이 살짝 깨어나고 있어요";
  }

  const stage = Math.min(Math.max(level, 1), 5);
  const byLevel: Record<number, string> = {
    1: "작은 씨앗이 막 싹을 틔웠어요",
    2: "잎이 하나둘 나오기 시작했어요",
    3: "줄기가 튼튼하게 자라고 있어요",
    4: "꽃봉오리가 맺히기 시작했어요",
    5: "꽃과 열매까지 열린 마음의 화분이에요!",
  };

  if (hp === 0) {
    return `레벨 ${level} 달성! 긍정의 말로 키워 보세요`;
  }
  if (wiltedByNegative && hp <= 25) {
    return "마음이 무거워요… 따뜻한 말이 필요해요";
  }

  return byLevel[stage];
}

const BOT = {
  welcome:
    "안녕하세요. 작은 씨앗에게 긍정의 말을 해주면 화분에 싹이 돋아요. 힘든 감정도 편하게 내려놓으세요.",
  levelUp: [
    "레벨 업! 씨앗이 화분에 싹을 틔웠어요!",
    "레벨 업! 🎉 마음 정원이 더 넓어졌어요!",
    "새 단계 달성! 식물이 한 단계 진화했어요 ✨",
    "축하해요! 당신의 마음 씨앗이 더 단단해졌어요 🌳",
  ],
};

const QUICK_HINTS = ["오늘도 고생했어", "힘들어", "감사해", "행복해"];

const QUICK_EMOJIS: { emoji: string; tone: "positive" | "negative" }[] = [
  { emoji: "😊", tone: "positive" },
  { emoji: "🙂", tone: "positive" },
  { emoji: "😚", tone: "positive" },
  { emoji: "😭", tone: "negative" },
  { emoji: "😡", tone: "negative" },
];

const SPROUT_WIDTH = 176;
const SPROUT_HEIGHT = 331;

type BackgroundId = "room" | "beige" | "grassland";

const BACKGROUNDS: {
  id: BackgroundId;
  label: string;
  src?: string;
  imageClass?: string;
  sceneClass?: string;
}[] = [
  {
    id: "room",
    label: "햇살 창가",
    src: "/background-01.png",
    imageClass: "object-cover object-[center_55%]",
  },
  {
    id: "beige",
    label: "몽글 베이지",
    sceneClass: "bg-gradient-to-b from-[#f7f2ea] via-[#efe8dc] to-[#e4d8c8]",
  },
  {
    id: "grassland",
    label: "푸른 초원",
    src: "/grassland01.png",
    imageClass: "object-cover object-center",
  },
];

type MenuSection = "main" | "background";

type MenuItemId = "journey" | "store" | "item" | "background" | "calendar";

const MENU_ITEMS: { id: MenuItemId; label: string }[] = [
  { id: "journey", label: "Journey" },
  { id: "store", label: "Store" },
  { id: "item", label: "Item" },
  { id: "background", label: "Background" },
  { id: "calendar", label: "Calendar" },
];

function MenuIcon({ id }: { id: MenuItemId }) {
  const className = "h-5 w-5 shrink-0 text-[#6d8a5e]";

  switch (id) {
    case "journey":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M4 18 9 5l3 7 4-4 4 10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="5" r="1.5" fill="currentColor" />
        </svg>
      );
    case "store":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M5 9h14l-1.2 11H6.2L5 9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8 9V7a4 4 0 0 1 8 0v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "item":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 3 20 7v10l-8 4-8-4V7l8-4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12 11v10M4.5 7.5 12 11l7.5-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "background":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3 15l5-4 4 3 3-2 6 5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="9" r="1.5" fill="currentColor" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 3v4M16 3v4M4 10h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="8" y="13" width="3" height="3" rx="0.5" fill="currentColor" />
        </svg>
      );
  }
}

export default function Home() {
  const [level, setLevel] = useState(0);
  const [hp, setHp] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: BOT.welcome },
  ]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const [plantFx, setPlantFx] = useState<PlantFx>("float");
  const [hpGlow, setHpGlow] = useState<"none" | "up" | "down">("none");
  const [watering, setWatering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<MenuSection>("main");
  const [backgroundId, setBackgroundId] = useState<BackgroundId>("room");
  const [wiltedByNegative, setWiltedByNegative] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  useEffect(() => {
    saveDayMessages(formatDateKey(new Date()), messages);
  }, [messages]);

  useEffect(() => {
    const audio = new Audio("/sounds/pop11.mp3");
    audio.preload = "auto";
    popSoundRef.current = audio;

    return () => {
      audio.pause();
      popSoundRef.current = null;
      if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
    };
  }, []);

  function triggerWatering() {
    if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
    setWatering(true);
    wateringTimerRef.current = setTimeout(() => {
      setWatering(false);
      wateringTimerRef.current = null;
    }, 1300);
  }

  function applyHpGain(gain: number, plantFxKind?: PlantFx) {
    let newHp = Math.min(MAX_HP, hp + gain);
    let newLevel = level;
    const hpIncreased = newHp > hp;
    let leveledUp = false;

    if (newHp >= LEVEL_UP_THRESHOLD) {
      newLevel = level + 1;
      newHp = 0;
      leveledUp = true;
      setWiltedByNegative(false);
      triggerWatering();
      flashHpGlow("up");
      playFx("bloom");
    } else if (hpIncreased) {
      setWiltedByNegative(false);
      triggerWatering();
      flashHpGlow("up");
      playFx(plantFxKind ?? "float");
    }

    setHp(newHp);
    setLevel(newLevel);

    return { leveledUp, hpIncreased };
  }

  function playPopSound() {
    const audio = popSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function handlePotClick() {
    playPopSound();
    applyHpGain(HP_POT_GAIN);
  }

  function playFx(kind: PlantFx) {
    setPlantFx(kind);
    const ms = kind === "shake" || kind === "wilt" ? 600 : 700;
    setTimeout(() => setPlantFx("float"), ms);
  }

  function flashHpGlow(dir: "up" | "down") {
    setHpGlow(dir);
    setTimeout(() => setHpGlow("none"), 800);
  }

  async function fetchBotReply(
    message: string,
    tone: Sentiment,
    options: {
      level: number;
      hp: number;
      leveledUp: boolean;
      wasRevived: boolean;
    },
  ): Promise<string> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          tone,
          level: options.level,
          hp: options.hp,
          leveledUp: options.leveledUp,
          wasRevived: options.wasRevived,
        }),
      });

      if (!response.ok) throw new Error("chat api failed");

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();
      if (reply) return reply;
    } catch {
      // fall through to local fallback
    }

    return getFallbackReply({
      tone,
      level: options.level,
      hp: options.hp,
      leveledUp: options.leveledUp,
      wasRevived: options.wasRevived,
    });
  }

  async function dispatchUserMessage(text: string, tone: Sentiment) {
    if (isBotTyping) return;

    recordMoodEntry(text, tone);

    const userMsg: Message = { id: nextId, from: "user", text, tone };
    let id = nextId + 1;
    let leveledUp = false;
    const wasDead = hp === 0 && wiltedByNegative;

    if (tone === "positive") {
      const gain = wasDead ? HP_GAIN + 10 : HP_GAIN;
      ({ leveledUp } = applyHpGain(gain, wasDead ? "bloom" : undefined));
    } else if (tone === "negative") {
      const newHp = Math.max(0, hp - HP_LOSS);
      setWiltedByNegative(true);
      flashHpGlow("down");
      playFx(newHp === 0 ? "wilt" : "shake");
      setHp(newHp);
    }

    setMessages((prev) => [...prev, userMsg]);
    setNextId(id);
    setIsBotTyping(true);

    try {
      const reply = await fetchBotReply(text, tone, {
        level,
        hp,
        leveledUp,
        wasRevived: wasDead && tone === "positive",
      });

      const botBatch: Message[] = [
        { id: id++, from: "bot", text: reply, tone },
      ];

      if (leveledUp) {
        botBatch.push({
          id: id++,
          from: "bot",
          text: randomOf(BOT.levelUp),
          tone: "positive",
        });
      }

      setMessages((prev) => [...prev, ...botBatch]);
      setNextId(id);
    } finally {
      setIsBotTyping(false);
    }
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBotTyping) return;

    void dispatchUserMessage(text, detectSentiment(text));
    setInput("");
    inputRef.current?.focus();
  }

  function sendHint(hint: string) {
    setInput(hint);
    inputRef.current?.focus();
  }

  function sendEmoji(emoji: string, tone: "positive" | "negative") {
    if (isBotTyping) return;
    void dispatchUserMessage(emoji, tone);
    inputRef.current?.focus();
  }

  const hpPercent = Math.round((hp / MAX_HP) * 100);
  const sproutSrc = getSproutSrc(level);
  const isSeedStage = level === 0;
  const selectedBackground =
    BACKGROUNDS.find((bg) => bg.id === backgroundId) ?? BACKGROUNDS[0];
  const potToneClass =
    wiltedByNegative && hp === 0
      ? "grayscale opacity-45 saturate-50"
      : wiltedByNegative && hp <= 25
        ? "grayscale-[40%] opacity-75 saturate-75"
        : "opacity-100";
  const barColor =
    wiltedByNegative && hp === 0
      ? "#b5aea3"
      : hp === 0
        ? "#c4b896"
        : wiltedByNegative && hp <= 25
          ? "#e8a598"
          : hp <= 50
            ? "#c4b896"
            : "#8fad7a";

  return (
    <>
      <style>{`
        @keyframes heal-float {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes heal-shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-10px) rotate(-4deg); }
          40% { transform: translateX(10px) rotate(4deg); }
          60% { transform: translateX(-6px) rotate(-2deg); }
          80% { transform: translateX(6px) rotate(2deg); }
        }
        @keyframes heal-bloom {
          0% { transform: scale(1); filter: brightness(1); }
          40% { transform: scale(1.2); filter: brightness(1.15); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes heal-wilt {
          0% { transform: rotate(0) scale(1); }
          50% { transform: rotate(8deg) scale(0.92); opacity: 0.7; }
          100% { transform: rotate(12deg) scale(0.88); opacity: 0.55; }
        }
        .plant-float { animation: heal-float 3.4s ease-in-out infinite; }
        .plant-shake { animation: heal-shake 0.55s ease-in-out; }
        .plant-bloom { animation: heal-bloom 0.75s ease-out; }
        .plant-wilt { animation: heal-wilt 0.6s ease-in forwards; }
        .hp-glow-up { box-shadow: 0 0 18px 4px rgba(156, 175, 136, 0.45); }
        .hp-glow-down { box-shadow: 0 0 18px 4px rgba(232, 165, 152, 0.5); }
        @keyframes water-can-pour {
          0% { opacity: 0; transform: translate(18px, -28px) rotate(-12deg) scale(0.65); }
          18% { opacity: 1; transform: translate(10px, -16px) rotate(-32deg) scale(0.88); }
          45% { opacity: 1; transform: translate(2px, -8px) rotate(-50deg) scale(1); }
          75% { opacity: 1; transform: translate(2px, -8px) rotate(-50deg) scale(1); }
          100% { opacity: 0; transform: translate(-2px, -2px) rotate(-36deg) scale(0.9); }
        }
        @keyframes water-stream {
          0% { opacity: 0; height: 0; }
          25% { opacity: 0.85; height: 18px; }
          70% { opacity: 0.55; height: 34px; }
          100% { opacity: 0; height: 42px; }
        }
        @keyframes water-drop {
          0% { opacity: 0; transform: translateY(0) scale(0.7); }
          20% { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(22px) scale(1); }
        }
        .water-can-pour { animation: water-can-pour 1.2s ease-in-out forwards; }
        .water-stream { animation: water-stream 1s ease-in forwards; }
        .water-drop { animation: water-drop 0.9s ease-in forwards; }
        .water-drop-delay { animation-delay: 0.15s; }
        .water-drop-delay-2 { animation-delay: 0.28s; }
      `}</style>

      <div className="relative flex min-h-dvh flex-col bg-[#FDFBF7]">
        {/* 배경 몽글몽글 장식 */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#9caf88]/14 blur-3xl" />
          <div className="absolute -right-16 top-1/4 h-52 w-52 rounded-full bg-[#a3bcc9]/20 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-[#e8a598]/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-[#e8dcc8]/50 blur-3xl" />
        </div>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:max-w-lg sm:px-6 sm:py-8">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => {
                if (open) setMenuSection("main");
                return !open;
              });
            }}
            aria-label="메뉴 열기"
            aria-expanded={menuOpen}
            className="absolute left-4 top-[max(1.25rem,env(safe-area-inset-top))] z-30 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-[#e8dcc8] bg-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white sm:left-6 sm:top-8"
          >
            <span className="block h-0.5 w-5 rounded-full bg-[#4a5248]" />
            <span className="block h-0.5 w-5 rounded-full bg-[#4a5248]" />
            <span className="block h-0.5 w-5 rounded-full bg-[#4a5248]" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="메뉴 닫기"
                className="fixed inset-0 z-40 bg-[#4a5248]/20"
                onClick={() => {
                  setMenuOpen(false);
                  setMenuSection("main");
                }}
              />
              <nav className="absolute left-4 top-[calc(max(1.25rem,env(safe-area-inset-top))+3rem)] z-50 w-52 overflow-hidden rounded-2xl border border-[#e8e0d4] bg-white/95 shadow-lg backdrop-blur-md sm:left-6 sm:top-[calc(2rem+3rem)]">
                {menuSection === "main" ? (
                  <>
                    <p className="border-b border-[#ede8df] px-4 py-3 text-sm font-semibold text-[#4a5248]">
                      메뉴
                    </p>
                    <ul className="p-2">
                      {MENU_ITEMS.map((item) => (
                        <li key={item.id}>
                          {item.id === "calendar" ? (
                            <Link
                              href="/calendar"
                              onClick={() => {
                                setMenuOpen(false);
                                setMenuSection("main");
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4a5248] transition hover:bg-[#f5f0e8]"
                            >
                              <MenuIcon id={item.id} />
                              Emotion calendar
                            </Link>
                          ) : item.id === "background" ? (
                            <button
                              type="button"
                              onClick={() => setMenuSection("background")}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4a5248] transition hover:bg-[#f5f0e8]"
                            >
                              <MenuIcon id={item.id} />
                              background
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMenuOpen(false)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4a5248] transition hover:bg-[#f5f0e8]"
                            >
                              <MenuIcon id={item.id} />
                              {item.label}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 border-b border-[#ede8df] px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setMenuSection("main")}
                        aria-label="메뉴로 돌아가기"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#4a5248] transition hover:bg-[#f5f0e8]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-4 w-4"
                          aria-hidden
                        >
                          <path
                            d="M15 6 9 12l6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <MenuIcon id="background" />
                      <p className="text-sm font-semibold text-[#4a5248]">
                        background
                      </p>
                    </div>
                    <ul className="p-2">
                      {BACKGROUNDS.map((bg) => (
                        <li key={bg.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setBackgroundId(bg.id);
                              setMenuOpen(false);
                              setMenuSection("main");
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              backgroundId === bg.id
                                ? "bg-[#9caf88]/20 font-semibold text-[#3d5235]"
                                : "text-[#4a5248] hover:bg-[#f5f0e8]"
                            }`}
                          >
                            <span
                              className={`h-8 w-10 shrink-0 overflow-hidden rounded-md border border-[#e8dcc8] ${
                                bg.sceneClass ?? "bg-[#f0ebe3]"
                              }`}
                              aria-hidden
                            >
                              {bg.src && (
                                <Image
                                  src={bg.src}
                                  alt=""
                                  width={40}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </span>
                            {bg.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </nav>
            </>
          )}

          {/* ── 상단: 레벨 & HP ── */}
          <header className="shrink-0 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 pl-1 sm:gap-4 sm:pl-0">
                <div className="w-10 shrink-0" aria-hidden />
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8ba4b4]">
                    HEALING GARDEN
                  </p>
                  <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">
                    마음의 화분
                  </h1>
                </div>
              </div>
              <div className="rounded-2xl border border-[#e8dcc8] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8a598]">
                  Mind level
                </p>
                <p className="text-2xl font-bold text-[#6d8a5e]">Lv.{level}</p>
              </div>
            </div>

            <div
              className={`rounded-2xl border border-[#e8e0d4] bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-shadow duration-500 ${
                hpGlow === "up"
                  ? "hp-glow-up"
                  : hpGlow === "down"
                    ? "hp-glow-down"
                    : ""
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#6d8a5e]">HP</span>
                <span className="tabular-nums font-medium text-[#4a5248]">
                  {hp} / {MAX_HP}
                  <span className="ml-1 text-[#8ba4b4]">({hpPercent}%)</span>
                </span>
              </div>
              <div className="h-5 overflow-hidden rounded-full bg-[#ede8df] shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${hpPercent}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          </header>

          {/* ── 성장 공간 + 화분 (배경 위) ── */}
          <main className="mt-2 flex min-h-0 flex-1 flex-col sm:mt-3">
            <div
              className={`relative min-h-[11.5rem] w-full flex-1 overflow-hidden rounded-2xl border border-[#e8dcc8]/80 shadow-md sm:min-h-[13.5rem] ${selectedBackground.sceneClass ?? ""}`}
            >
              {selectedBackground.src && (
                <Image
                  src={selectedBackground.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className={selectedBackground.imageClass ?? "object-cover"}
                  priority
                />
              )}

              <div
                className={`absolute inset-x-0 z-[1] flex justify-center ${
                  isSeedStage
                    ? "inset-y-0 items-center"
                    : "bottom-[5%] sm:bottom-[6%]"
                }`}
              >
                <div className="relative flex justify-center">
                  {watering && (
                    <div
                      className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${
                        isSeedStage ? "-top-10 sm:-top-12" : "-top-8 sm:-top-9"
                      }`}
                      aria-hidden
                    >
                      <div className="water-can-pour relative">
                        <Image
                          src="/watering-can.png"
                          alt=""
                          width={256}
                          height={256}
                          className="h-10 w-10 drop-shadow-md sm:h-12 sm:w-12"
                        />
                        <div className="absolute left-1.5 top-[2.1rem] flex flex-col items-center sm:left-2 sm:top-[2.55rem]">
                          <div className="water-stream w-0.5 rounded-full bg-[#8ec5e8]/80" />
                          <span className="water-drop mt-0.5 block h-1 w-1 rounded-full bg-[#8ec5e8]" />
                          <span className="water-drop water-drop-delay mt-0.5 block h-0.5 w-0.5 rounded-full bg-[#a3d4f0]" />
                          <span className="water-drop water-drop-delay-2 mt-0.5 block h-0.5 w-0.5 rounded-full bg-[#b8dff7]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePotClick}
                    aria-label={
                      isSeedStage
                        ? "씨앗을 눌러 물 주기"
                        : `레벨 ${level} 화분을 눌러 물 주기`
                    }
                    className={`relative z-0 flex cursor-pointer justify-center border-0 bg-transparent p-0 transition active:scale-95 ${
                      isSeedStage ? "items-center" : "items-end"
                    } ${
                      plantFx === "shake"
                        ? "plant-shake"
                        : plantFx === "bloom"
                          ? "plant-bloom"
                          : plantFx === "wilt"
                            ? "plant-wilt"
                            : "plant-float"
                    }`}
                  >
                    {isSeedStage ? (
                      <Image
                        key="seed"
                        src="/seed001.png"
                        alt="마음의 씨앗"
                        width={SEED_SIZE}
                        height={SEED_SIZE}
                        priority
                        draggable={false}
                        className={`pointer-events-none h-auto w-14 select-none object-contain drop-shadow-[0_10px_18px_rgba(62,52,42,0.18)] transition-all duration-700 sm:w-16 ${potToneClass}`}
                      />
                    ) : (
                      sproutSrc && (
                        <Image
                          key={level}
                          src={sproutSrc}
                          alt={`레벨 ${level} 마음의 화분`}
                          width={SPROUT_WIDTH}
                          height={SPROUT_HEIGHT}
                          priority
                          draggable={false}
                          className={`pointer-events-none h-auto w-[4.75rem] select-none object-contain object-bottom drop-shadow-[-3px_5px_10px_rgba(62,52,42,0.28)] transition-all duration-700 sm:w-[5.5rem] ${potToneClass}`}
                        />
                      )
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-3 max-w-xs self-center rounded-full border border-[#e8dcc8] bg-white/80 px-5 py-2 text-center text-sm font-medium leading-relaxed text-[#6d8a5e] shadow-sm">
              {getPlantStatus(hp, level, wiltedByNegative)}
            </p>
            <p className="mt-2 pb-1 text-center text-xs text-[#8ba4b4]">
              {isSeedStage
                ? "긍정의 말 한마디가 씨앗을 깨워요 · 씨앗을 터치해 물도 줄 수 있어요"
                : "긍정의 말 한마디가 씨앗을 깨워요 · 화분을 터치해 물도 줄 수 있어요"}
            </p>
          </main>

          {/* ── 하단: 채팅창 ── */}
          <footer className="shrink-0 overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white/90 shadow-lg backdrop-blur-md">
            <div className="border-b border-[#ede8df] bg-gradient-to-r from-[#f5f0e8]/80 to-white/60 px-4 py-3">
              <p className="text-sm font-semibold text-[#4a5248]">
                마음 쓰레기통
              </p>
              <p className="mt-0.5 text-xs text-[#8ba4b4]">
                긍정의 말 → 성장 · 부정의 말 → 받아줄게요
              </p>
            </div>

            <div className="flex max-h-40 min-h-28 flex-col gap-2 overflow-y-auto px-3 py-3 sm:max-h-48 sm:min-h-32">
              {messages.map((msg) => (
                <div
                  key={msg.id}
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
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <p className="rounded-2xl rounded-bl-md bg-[#f0ebe3] px-3.5 py-2 text-[13px] text-[#8ba4b4] sm:text-sm">
                    마음을 담아 답하는 중…
                  </p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 빠른 입력 힌트 */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-[#ede8df]/60 px-3 py-2">
              {QUICK_HINTS.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => sendHint(hint)}
                  disabled={isBotTyping}
                  className="rounded-full border border-[#e8dcc8] bg-[#FDFBF7] px-3 py-1 text-[11px] font-medium text-[#6d8a5e] transition hover:border-[#9caf88] hover:bg-[#9caf88]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
                >
                  {hint}
                </button>
              ))}
              {QUICK_EMOJIS.map(({ emoji, tone }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => sendEmoji(emoji, tone)}
                  disabled={isBotTyping}
                  aria-label={
                    tone === "positive" ? `긍정 이모지 ${emoji}` : `부정 이모지 ${emoji}`
                  }
                  className={`rounded-full border bg-[#FDFBF7] px-2.5 py-1 text-base leading-none transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    tone === "positive"
                      ? "border-[#d4e4c8] hover:border-[#9caf88] hover:bg-[#9caf88]/10"
                      : "border-[#d8e2e8] hover:border-[#a3bcc9] hover:bg-[#a3bcc9]/15"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form
              onSubmit={sendMessage}
              className="flex gap-2 border-t border-[#ede8df] p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="지금 마음을 적어 보세요…"
                className="min-w-0 flex-1 rounded-2xl border border-[#e8e0d4] bg-[#FDFBF7] px-4 py-3 text-sm text-[#4a5248] outline-none transition placeholder:text-[#b5aea3] focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25"
                aria-label="메시지 입력"
              />
              <button
                type="submit"
                disabled={!input.trim() || isBotTyping}
                className="shrink-0 rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                보내기
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
