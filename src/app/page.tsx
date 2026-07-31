"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useBgm } from "@/components/BgmProvider";
import { PotionBadge } from "@/components/PotionBadge";
import { PotionIcon } from "@/components/PotionIcon";
import { RootStrengthenMode } from "@/components/RootStrengthenMode";
import { BackgroundSceneOverlay } from "@/components/BackgroundPreview";
import { SproutCharacter } from "@/components/SproutCharacter";
import { WateringCan } from "@/components/WateringCan";
import { formatDateKey, saveDayMessages } from "@/lib/chat-history";
import { completeDailyQuest } from "@/lib/daily-quests";
import { getFallbackReply } from "@/lib/healing-bot";
import {
  BACKGROUNDS,
  getBackgroundById,
  type BackgroundId,
} from "@/lib/backgrounds";
import {
  getEquipped,
  INVENTORY_CHANGE_EVENT,
} from "@/lib/inventory";
import { recordMoodEntry } from "@/lib/mood-log";
import {
  BUBBLE_VISIBLE_MS,
  nextBubbleDelayMs,
  pickPotBubble,
} from "@/lib/pot-bubbles";
import { getPlantState, setPlantState } from "@/lib/plant-state";
import { getRootState, type RootState } from "@/lib/root-strength";
import {
  detectPlantMood,
  detectSentiment,
  type PlantMood,
  type Sentiment,
} from "@/lib/sentiment";
import type { PotSkinId } from "@/lib/store-catalog";

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

const POT_NAME_KEY = "healing-garden-pot-name";
const POT_TOUCH_GUIDE_KEY = "healing-garden-pot-touch-guide";
const ROOT_GUIDE_KEY = "healing-garden-root-guide";
const MAX_POT_NAME_LENGTH = 10;

/** 이름 뒤에 을/를 조사 붙이기 */
function withEulReul(name: string): string {
  const last = name.charAt(name.length - 1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${name}을(를)`;
  const hasBatchim = (code - 0xac00) % 28 !== 0;
  return hasBatchim ? `${name}을` : `${name}를`;
}

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
  { emoji: "🥰", tone: "positive" },
  { emoji: "😭", tone: "negative" },
  { emoji: "😡", tone: "negative" },
];

type MenuItemId = "journey" | "store" | "item" | "calendar" | "settings";

const MENU_ITEMS: { id: MenuItemId; label: string }[] = [
  { id: "journey", label: "Journey" },
  { id: "store", label: "Store" },
  { id: "item", label: "Item" },
  { id: "calendar", label: "Calendar" },
  { id: "settings", label: "Settings" },
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
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export default function Home() {
  const { ensurePlaying } = useBgm();
  const [level, setLevel] = useState(0);
  const [hp, setHp] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: BOT.welcome },
  ]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const [plantFx, setPlantFx] = useState<PlantFx>("float");
  const [plantMood, setPlantMood] = useState<PlantMood>("none");
  const [moodPulse, setMoodPulse] = useState(0);
  const plantMoodTimerRef = useRef<number | null>(null);
  const [hpGlow, setHpGlow] = useState<"none" | "up" | "down">("none");
  const [watering, setWatering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [backgroundId, setBackgroundId] = useState<BackgroundId>("room");
  const [potSkinId, setPotSkinId] = useState<PotSkinId>("default");
  const [wiltedByNegative, setWiltedByNegative] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showRootMode, setShowRootMode] = useState(false);
  const [rootState, setRootState] = useState<RootState>({ level: 0, hp: 0 });
  const [potName, setPotName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPotTouchGuide, setShowPotTouchGuide] = useState(false);
  const [potGuideLeaving, setPotGuideLeaving] = useState(false);
  const [showRootGuide, setShowRootGuide] = useState(false);
  const [potBubble, setPotBubble] = useState<string | null>(null);
  const [potBubbleLeaving, setPotBubbleLeaving] = useState(false);
  const [plantHydrated, setPlantHydrated] = useState(false);
  const [questToast, setQuestToast] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const bubblePopSoundRef = useRef<HTMLAudioElement | null>(null);
  const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const questToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const potBubbleTextRef = useRef<string | null>(null);
  const potBubbleHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const potBubbleScheduleRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dismissPotBubbleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping]);

  useEffect(() => {
    return () => {
      if (plantMoodTimerRef.current) {
        window.clearTimeout(plantMoodTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    saveDayMessages(formatDateKey(new Date()), messages);
  }, [messages]);

  useEffect(() => {
    setRootState(getRootState());
  }, []);

  // 장착된 배경·화분 스킨 — inventory에서 로드
  useEffect(() => {
    function syncEquipped() {
      const equipped = getEquipped();
      setBackgroundId(equipped.backgroundId);
      setPotSkinId(equipped.potSkinId);
    }
    syncEquipped();
    window.addEventListener(INVENTORY_CHANGE_EVENT, syncEquipped);
    window.addEventListener("focus", syncEquipped);
    return () => {
      window.removeEventListener(INVENTORY_CHANGE_EVENT, syncEquipped);
      window.removeEventListener("focus", syncEquipped);
    };
  }, []);

  // Journey 지하 여정 등에서 /?openRoot=1 로 오면 뿌리 강화 모드를 바로 연다.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openRoot") !== "1") return;
    setShowRootMode(true);
    window.history.replaceState({}, "", "/");
  }, []);

  // 화분 레벨/HP는 Journey 지도가 실제 성장 이력을 보여줄 수 있도록 저장해둔다.
  useEffect(() => {
    const saved = getPlantState();
    setLevel(saved.level);
    setHp(saved.hp);
    setWiltedByNegative(saved.wiltedByNegative);
    setPlantHydrated(true);
  }, []);

  useEffect(() => {
    if (!plantHydrated) return;
    setPlantState({ level, hp, wiltedByNegative });
  }, [level, hp, wiltedByNegative, plantHydrated]);

  useEffect(() => {
    const savedName = window.localStorage.getItem(POT_NAME_KEY)?.trim() ?? "";
    if (savedName) {
      setPotName(savedName);
      if (window.localStorage.getItem(POT_TOUCH_GUIDE_KEY) !== "done") {
        setShowPotTouchGuide(true);
      }
    } else {
      setShowWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (!showWelcome) return;
    const id = window.setTimeout(() => nameInputRef.current?.focus(), 180);
    return () => window.clearTimeout(id);
  }, [showWelcome]);

  useEffect(() => {
    const paused =
      showWelcome || showPotTouchGuide || showRootMode || showRootGuide;
    if (paused) {
      if (potBubbleScheduleRef.current) {
        clearTimeout(potBubbleScheduleRef.current);
        potBubbleScheduleRef.current = null;
      }
      return;
    }

    let cancelled = false;

    let isLeaving = false;

    const hideBubble = () => {
      if (cancelled || isLeaving) return;
      if (!potBubbleTextRef.current) return;
      isLeaving = true;
      setPotBubbleLeaving(true);
      if (potBubbleHideTimerRef.current) {
        clearTimeout(potBubbleHideTimerRef.current);
      }
      potBubbleHideTimerRef.current = setTimeout(() => {
        setPotBubble(null);
        setPotBubbleLeaving(false);
        potBubbleTextRef.current = null;
        potBubbleHideTimerRef.current = null;
        isLeaving = false;
      }, 320);
    };

    dismissPotBubbleRef.current = hideBubble;

    const showBubble = () => {
      if (cancelled) return;
      const next = pickPotBubble(potName, potBubbleTextRef.current);
      potBubbleTextRef.current = next.text;
      isLeaving = false;
      setPotBubbleLeaving(false);
      setPotBubble(next.text);
      if (potBubbleHideTimerRef.current) {
        clearTimeout(potBubbleHideTimerRef.current);
      }
      potBubbleHideTimerRef.current = setTimeout(hideBubble, BUBBLE_VISIBLE_MS);
    };

    const scheduleNext = (delay: number) => {
      if (potBubbleScheduleRef.current) {
        clearTimeout(potBubbleScheduleRef.current);
      }
      potBubbleScheduleRef.current = setTimeout(() => {
        showBubble();
        scheduleNext(nextBubbleDelayMs());
      }, delay);
    };

    // 첫 말풍선은 조금 빨리, 이후는 랜덤 간격
    scheduleNext(6000 + Math.floor(Math.random() * 4000));

    return () => {
      cancelled = true;
      dismissPotBubbleRef.current = null;
      if (potBubbleScheduleRef.current) {
        clearTimeout(potBubbleScheduleRef.current);
        potBubbleScheduleRef.current = null;
      }
      if (potBubbleHideTimerRef.current) {
        clearTimeout(potBubbleHideTimerRef.current);
        potBubbleHideTimerRef.current = null;
      }
    };
  }, [showWelcome, showPotTouchGuide, showRootMode, showRootGuide, potName]);

  useEffect(() => {
    const audio = new Audio("/sounds/pop11.mp3");
    audio.preload = "auto";
    popSoundRef.current = audio;

    const bubblePop = new Audio("/sounds/bubble-soft.wav");
    bubblePop.preload = "auto";
    bubblePop.volume = 0.35;
    bubblePopSoundRef.current = bubblePop;

    return () => {
      audio.pause();
      popSoundRef.current = null;
      bubblePop.pause();
      bubblePopSoundRef.current = null;
      if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
      if (questToastTimerRef.current) clearTimeout(questToastTimerRef.current);
    };
  }, []);

  function showQuestRewardToast(result: {
    newlyCompleted: boolean;
    potionGained: number;
    bonusGained: number;
  }) {
    if (!result.newlyCompleted) return;
    const total = result.potionGained + result.bonusGained;
    if (total <= 0) return;
    const label =
      result.bonusGained > 0
        ? `+${total} 포션 · 오늘 여정 완료!`
        : `+${total} 포션`;
    setQuestToast(label);
    if (questToastTimerRef.current) clearTimeout(questToastTimerRef.current);
    questToastTimerRef.current = setTimeout(() => {
      setQuestToast(null);
      questToastTimerRef.current = null;
    }, 1600);
  }

  function dismissPotTouchGuide() {
    if (!showPotTouchGuide && !potGuideLeaving) return;
    window.localStorage.setItem(POT_TOUCH_GUIDE_KEY, "done");
    setPotGuideLeaving(true);
    window.setTimeout(() => {
      setShowPotTouchGuide(false);
      setPotGuideLeaving(false);
    }, 380);
  }

  function handleWelcomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = nameDraft.trim().slice(0, MAX_POT_NAME_LENGTH);
    if (!name) {
      nameInputRef.current?.focus();
      return;
    }
    window.localStorage.setItem(POT_NAME_KEY, name);
    setPotName(name);
    setShowWelcome(false);
    setShowPotTouchGuide(true);
    ensurePlaying();
  }

  function triggerWatering() {
    if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
    setWatering(true);
    wateringTimerRef.current = setTimeout(() => {
      setWatering(false);
      wateringTimerRef.current = null;
    }, 1300);
  }

  function maybeShowRootGuide(reachedLevel: number) {
    if (reachedLevel !== 1) return;
    if (window.localStorage.getItem(ROOT_GUIDE_KEY) === "done") return;
    // 레벨업 연출이 끝난 뒤 안내창 표시
    window.setTimeout(() => setShowRootGuide(true), 700);
  }

  function dismissRootGuide(openRootMode = false) {
    window.localStorage.setItem(ROOT_GUIDE_KEY, "done");
    setShowRootGuide(false);
    if (openRootMode) setShowRootMode(true);
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
      maybeShowRootGuide(newLevel);
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

  function playBubblePopSound() {
    const audio = bubblePopSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function handlePotBubbleDismiss(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (potBubbleLeaving || !potBubble) return;
    playBubblePopSound();
    ensurePlaying();
    dismissPotBubbleRef.current?.();
  }

  function handlePotClick() {
    playPopSound();
    ensurePlaying();
    dismissPotTouchGuide();
    applyHpGain(HP_POT_GAIN);
    showQuestRewardToast(completeDailyQuest("water"));
  }

  function playFx(kind: PlantFx) {
    setPlantFx(kind);
    const ms = kind === "shake" || kind === "wilt" ? 600 : 700;
    setTimeout(() => setPlantFx("float"), ms);
  }

  function playMood(kind: PlantMood) {
    if (kind === "none") return;
    if (plantMoodTimerRef.current) {
      window.clearTimeout(plantMoodTimerRef.current);
    }
    setPlantMood(kind);
    setMoodPulse((n) => n + 1);
    const ms = kind === "love" ? 1600 : 1800;
    plantMoodTimerRef.current = window.setTimeout(() => {
      setPlantMood("none");
      plantMoodTimerRef.current = null;
    }, ms);
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

    ensurePlaying();
    recordMoodEntry(text, tone);
    showQuestRewardToast(completeDailyQuest("chat"));

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

    const mood = detectPlantMood(text);
    if (mood !== "none") {
      playMood(mood);
      if (mood === "love" && tone === "positive") {
        playFx("bloom");
      }
    } else if (tone === "negative") {
      // 명시적 마커가 없어도 부정 톤이면 공감 눈물
      playMood("cry");
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
    if (isBotTyping) return;
    void dispatchUserMessage(hint, detectSentiment(hint));
  }

  function sendEmoji(emoji: string, tone: "positive" | "negative") {
    if (isBotTyping) return;
    // 모바일에서 input focus 시 화면 확대되는 것을 막기 위해 포커스하지 않음
    void dispatchUserMessage(emoji, tone);
  }

  const hpPercent = Math.round((hp / MAX_HP) * 100);
  const isSeedStage = level === 0;
  const selectedBackground =
    getBackgroundById(backgroundId) ?? BACKGROUNDS[0];
  const isWiltedLook = wiltedByNegative && hp <= 25;
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
        @keyframes touch-guide-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes touch-guide-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes touch-hand-tap {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(-4px, 10px) scale(0.92); }
          55% { transform: translate(-2px, 6px) scale(0.96); }
        }
        @keyframes touch-ripple {
          0% { transform: scale(0.55); opacity: 0.5; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes pot-guide-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(156, 175, 136, 0.35); }
          50% { box-shadow: 0 0 0 10px rgba(156, 175, 136, 0); }
        }
        .touch-guide-enter { animation: touch-guide-in 0.4s ease-out both; }
        .touch-guide-leave { animation: touch-guide-out 0.35s ease-in both; pointer-events: none; }
        .touch-hand-tap { animation: touch-hand-tap 1.35s ease-in-out infinite; }
        .touch-ripple { animation: touch-ripple 1.35s ease-out infinite; }
        .pot-guide-pulse { animation: pot-guide-pulse 1.6s ease-out infinite; border-radius: 9999px; }
        @keyframes pot-bubble-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pot-bubble-out {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-4px) scale(0.96); }
        }
        .pot-bubble-enter { animation: pot-bubble-in 0.35s ease-out both; }
        .pot-bubble-leave { animation: pot-bubble-out 0.3s ease-in both; }
      `}</style>

      <div className="relative flex min-h-dvh flex-col bg-[#FDFBF7]">
        {showWelcome && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#4a5248]/35 px-5 backdrop-blur-[3px]">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="welcome-title"
              className="touch-guide-enter w-full max-w-sm rounded-3xl border border-[#e8e0d4] bg-[#FDFBF7] p-6 shadow-xl"
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8ba4b4]">
                HEALING GARDEN
              </p>
              <h2
                id="welcome-title"
                className="mt-1 text-xl font-bold text-[#4a5248]"
              >
                마음의 화분에 오신 걸 환영해요
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6d655c]">
                긍정의 말로 씨앗을 키우고, 무거운 감정은 마음 기록장에
                내려놓아 보세요. 당신만의 작은 정원이 자랄 거예요.
              </p>

              <form onSubmit={handleWelcomeSubmit} className="mt-5 space-y-3">
                <label
                  htmlFor="pot-name"
                  className="block text-sm font-semibold text-[#6d8a5e]"
                >
                  주인공 화분의 이름을 지어 주세요
                </label>
                <input
                  ref={nameInputRef}
                  id="pot-name"
                  type="text"
                  value={nameDraft}
                  onChange={(e) =>
                    setNameDraft(e.target.value.slice(0, MAX_POT_NAME_LENGTH))
                  }
                  maxLength={MAX_POT_NAME_LENGTH}
                  placeholder="예: 몽실이, 햇살"
                  className="w-full rounded-2xl border border-[#e8e0d4] bg-white px-4 py-3 text-base text-[#4a5248] outline-none transition placeholder:text-[#b5aea3] focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25"
                  autoComplete="off"
                />
                <p className="text-right text-[11px] text-[#8ba4b4]">
                  {nameDraft.trim().length}/{MAX_POT_NAME_LENGTH}
                </p>
                <button
                  type="submit"
                  disabled={!nameDraft.trim()}
                  className="w-full rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  정원 시작하기
                </button>
              </form>
            </div>
          </div>
        )}

        {showRootGuide && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#4a5248]/35 px-5 backdrop-blur-[3px]">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="root-guide-title"
              className="touch-guide-enter w-full max-w-sm rounded-3xl border border-[#e8e0d4] bg-[#FDFBF7] p-6 shadow-xl"
            >
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#6d8a5e]">
                LEVEL UP · ROOT MODE
              </p>
              <h2
                id="root-guide-title"
                className="mt-1 text-xl font-bold text-[#4a5248]"
              >
                레벨 1 달성! 뿌리를 키워볼까요?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6d655c]">
                씨앗이 싹을 틔웠어요. 이제{" "}
                <span className="font-semibold text-[#6d8a5e]">
                  뿌리 강화 모드
                </span>
                를 쓸 수 있어요.
              </p>

              <ul className="mt-4 space-y-2.5 rounded-2xl border border-[#e8dcc8] bg-white/70 px-4 py-3.5 text-sm leading-relaxed text-[#4a5248]">
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-[#6d8a5e]" aria-hidden>
                    ①
                  </span>
                  <span>
                    오늘 아쉬웠던 일을 한 줄 적으면, 뿌리가 그 아래로
                    내려가요.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-[#6d8a5e]" aria-hidden>
                    ②
                  </span>
                  <span>
                    그럼에도 감사하거나 배운 점을 적으면 뿌리가 더
                    단단해져요.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-[#6d8a5e]" aria-hidden>
                    ③
                  </span>
                  <span>
                    뿌리가 강할수록 시련의 바람에도 덜 흔들려요.
                  </span>
                </li>
              </ul>

              <p className="mt-3 text-xs leading-relaxed text-[#8ba4b4]">
                화면 가운데{" "}
                <span className="font-semibold text-[#6d8a5e]">
                  뿌리 강화 모드
                </span>{" "}
                버튼으로 언제든 다시 들어갈 수 있어요.
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => dismissRootGuide(true)}
                  className="w-full rounded-2xl bg-gradient-to-b from-[#9caf88] to-[#7a9168] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:from-[#8fad7a] hover:to-[#6d8a5e] active:scale-[0.98]"
                >
                  뿌리 강화하러 가기
                </button>
                <button
                  type="button"
                  onClick={() => dismissRootGuide(false)}
                  className="w-full rounded-2xl border border-[#e8dcc8] bg-white/80 px-4 py-3 text-sm font-medium text-[#6d655c] transition hover:bg-white active:scale-[0.98]"
                >
                  나중에 할게요
                </button>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => setMenuOpen((open) => !open)}
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
                onClick={() => setMenuOpen(false)}
              />
              <nav className="absolute left-4 top-[calc(max(1.25rem,env(safe-area-inset-top))+3rem)] z-50 w-52 overflow-hidden rounded-2xl border border-[#e8e0d4] bg-white/95 shadow-lg backdrop-blur-md sm:left-6 sm:top-[calc(2rem+3rem)]">
                <ul className="p-2">
                  {MENU_ITEMS.map((item) => (
                    <li key={item.id}>
                      {item.id === "calendar" ? (
                        <Link
                          href="/calendar"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4a5248] transition hover:bg-[#f5f0e8]"
                        >
                          <MenuIcon id={item.id} />
                          Emotion calendar
                        </Link>
                      ) : (
                        <Link
                          href={
                            item.id === "journey"
                              ? "/journey"
                              : item.id === "store"
                                ? "/store"
                                : item.id === "item"
                                  ? "/item"
                                  : "/settings"
                          }
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#4a5248] transition hover:bg-[#f5f0e8]"
                        >
                          <MenuIcon id={item.id} />
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
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
              <div className="flex shrink-0 items-center gap-2">
                <PotionBadge />
                <div className="rounded-2xl border border-[#e8dcc8] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8a598]">
                    Mind level
                  </p>
                  <p className="text-2xl font-bold text-[#6d8a5e]">Lv.{level}</p>
                </div>
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
          <main className="mt-2 flex shrink-0 flex-col sm:mt-3">
            <div
              className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-[#e8dcc8]/80 shadow-md ${selectedBackground.sceneClass ?? ""}`}
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
              {selectedBackground.sceneClass && !selectedBackground.src && (
                <BackgroundSceneOverlay sceneId={selectedBackground.id} />
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
                      className={`pointer-events-none absolute left-1/2 z-10 -translate-x-[40%] ${
                        isSeedStage ? "-top-12 sm:-top-14" : "-top-10 sm:-top-12"
                      }`}
                      aria-hidden
                    >
                      <WateringCan />
                    </div>
                  )}

                  {(showPotTouchGuide || potGuideLeaving) && potName && (
                    <div
                      className={`pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center ${
                        isSeedStage
                          ? "-top-14 sm:-top-16"
                          : "-top-16 sm:-top-[4.75rem]"
                      } ${potGuideLeaving ? "touch-guide-leave" : "touch-guide-enter"}`}
                      aria-live="polite"
                    >
                      <p className="mb-1 whitespace-nowrap rounded-full border border-[#e8dcc8] bg-white/95 px-3 py-1 text-xs font-semibold text-[#6d8a5e] shadow-sm sm:text-sm">
                        {withEulReul(potName)} 터치해보세요
                      </p>
                      <span
                        className="touch-hand-tap text-3xl drop-shadow-sm select-none sm:text-4xl"
                        role="img"
                        aria-label={`${withEulReul(potName)} 터치해보세요`}
                      >
                        👆
                      </span>
                    </div>
                  )}

                  {(potBubble || potBubbleLeaving) &&
                    !showPotTouchGuide &&
                    !potGuideLeaving && (
                      <div
                        className={`absolute left-1/2 z-20 w-[min(15.5rem,78vw)] -translate-x-1/2 ${
                          isSeedStage
                            ? "-top-12 sm:-top-14"
                            : "-top-[4.25rem] sm:-top-[4.75rem]"
                        } ${potBubbleLeaving ? "pot-bubble-leave" : "pot-bubble-enter"}`}
                      >
                        <button
                          type="button"
                          data-no-click-sound
                          onClick={handlePotBubbleDismiss}
                          disabled={potBubbleLeaving}
                          aria-label="말풍선 닫기"
                          className="relative w-full cursor-pointer touch-manipulation rounded-2xl border border-[#e8dcc8] bg-white/95 px-3.5 py-2.5 text-center shadow-md backdrop-blur-sm transition active:scale-[0.97] disabled:cursor-default"
                        >
                          {potName && (
                            <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-[#8ba4b4]">
                              {potName}
                            </p>
                          )}
                          <p className="text-[13px] leading-snug font-medium text-[#4a5248] sm:text-sm">
                            {potBubble}
                          </p>
                          <span
                            className="absolute left-1/2 top-full -mt-px h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-r border-b border-[#e8dcc8] bg-white/95"
                            aria-hidden
                          />
                        </button>
                      </div>
                    )}

                  <button
                    type="button"
                    data-no-click-sound
                    onClick={handlePotClick}
                    aria-label={
                      potName
                        ? `${potName}을(를) 눌러 물 주기`
                        : isSeedStage
                          ? "씨앗을 눌러 물 주기"
                          : `레벨 ${level} 화분을 눌러 물 주기`
                    }
                    className={`relative z-[2] flex cursor-pointer items-end justify-center border-0 bg-transparent p-0 transition active:scale-95 ${
                      showPotTouchGuide ? "pot-guide-pulse" : ""
                    }`}
                  >
                    <SproutCharacter
                      level={level}
                      fx={plantFx}
                      wilted={isWiltedLook}
                      mood={plantMood}
                      moodPulse={moodPulse}
                      potSkinId={potSkinId}
                    />
                  </button>
                </div>
              </div>
            </div>

            {potName && (
              <p className="mt-2 text-center text-xs font-semibold tracking-wide text-[#8ba4b4]">
                {potName}
              </p>
            )}
            <p className="mt-1 max-w-xs self-center rounded-full border border-[#e8dcc8] bg-white/80 px-5 py-1.5 text-center text-sm font-medium leading-relaxed text-[#6d8a5e] shadow-sm">
              {getPlantStatus(hp, level, wiltedByNegative)}
            </p>
            <p className="mt-1 text-center text-xs text-[#8ba4b4]">
              {isSeedStage
                ? `긍정의 말 한마디가 씨앗을 깨워요 · ${potName ? withEulReul(potName) : "씨앗을"} 터치해 물도 줄 수 있어요`
                : `긍정의 말 한마디가 씨앗을 깨워요 · ${potName ? withEulReul(potName) : "화분을"} 터치해 물도 줄 수 있어요`}
            </p>

            {!isSeedStage && (
              <button
                type="button"
                onClick={() => setShowRootMode(true)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#b8c9a8] bg-gradient-to-b from-[#eef4e8] to-[#dce8d4] px-4 py-3 text-sm font-semibold text-[#4a5a3c] shadow-sm transition hover:from-[#e4eedc] hover:to-[#d0e0c8] active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 text-[#6d8a5e]"
                  aria-hidden
                >
                  <path
                    d="M12 12V7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 9.5C10.2 8.8 8.8 7.5 8 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9.5C13.8 8.8 15.2 7.5 16 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 12h18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 12.5C12 15.5 11.5 18 11 21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 13C9 15 6 17.5 4.5 20"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 13C15 15 18 17.5 19.5 20"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9.5 16.5C7.5 18 6 19 5 19.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                  <path
                    d="M14.5 16.5C16.5 18 18 19 19 19.8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                  <circle cx="11" cy="21" r="1" fill="currentColor" opacity="0.6" />
                  <circle cx="4.5" cy="20" r="0.9" fill="currentColor" opacity="0.5" />
                  <circle cx="19.5" cy="20" r="0.9" fill="currentColor" opacity="0.5" />
                </svg>
                뿌리 강화 모드
                {(rootState.level > 0 || rootState.hp > 0) && (
                  <span className="rounded-full bg-[#6d8a5e]/15 px-2 py-0.5 text-[11px] font-bold text-[#6d8a5e]">
                    Lv.{rootState.level}
                  </span>
                )}
              </button>
            )}
          </main>

          {/* ── 하단: 채팅창 ── */}
          <footer className="mt-2 shrink-0 overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white/90 shadow-lg backdrop-blur-md">
            <div className="border-b border-[#ede8df] bg-gradient-to-r from-[#f5f0e8]/80 to-white/60 px-4 py-3">
              <p className="text-sm font-semibold text-[#4a5248]">
                마음 기록장
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
                className="min-w-0 flex-1 rounded-2xl border border-[#e8e0d4] bg-[#FDFBF7] px-4 py-3 text-base text-[#4a5248] outline-none transition placeholder:text-[#b5aea3] focus:border-[#9caf88] focus:ring-2 focus:ring-[#9caf88]/25"
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

      {showRootMode && (
        <RootStrengthenMode
          onClose={() => setShowRootMode(false)}
          onRootStateChange={setRootState}
          onSessionComplete={() =>
            showQuestRewardToast(completeDailyQuest("root"))
          }
        />
      )}

      {questToast && (
        <div className="pointer-events-none fixed left-1/2 top-[22%] z-[100] -translate-x-1/2 animate-bounce rounded-full bg-[#4a5248]/85 px-4 py-2 text-sm font-bold text-white shadow-lg">
          <PotionIcon className="mr-1 inline-block h-4 w-4 text-[#e8c9ee]" />
          {questToast}
        </div>
      )}
    </>
  );
}
