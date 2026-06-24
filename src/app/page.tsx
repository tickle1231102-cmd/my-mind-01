"use client";

import { useEffect, useRef, useState } from "react";

/* ── 긍정 / 부정 키워드 사전 ── */
const POSITIVE_WORDS = [
  "감사",
  "행복",
  "잘했",
  "최고",
  "좋아",
  "좋은",
  "사랑",
  "희망",
  "기쁨",
  "성공",
  "응원",
  "축하",
  "힐링",
  "긍정",
  "멋지",
  "예쁘",
  "힘내",
  "해냈",
  "달성",
  "완벽",
  "평화",
  "따뜻",
  "포근",
  "즐거",
  "만족",
  "괜찮",
  "회복",
  "치유",
  "자랑",
  "소중",
  "웃음",
  "설렘",
  "편안",
  "고마",
  "잘될",
  "할 수",
  "가능",
  "good",
  "great",
  "love",
  "happy",
  "thanks",
  "hope",
  "proud",
  "nice",
  "wonderful",
];

const NEGATIVE_WORDS = [
  "짜증",
  "힘들",
  "우울",
  "실패",
  "슬픔",
  "화나",
  "분노",
  "싫어",
  "미워",
  "최악",
  "포기",
  "외로",
  "불안",
  "걱정",
  "피곤",
  "지침",
  "아프",
  "절망",
  "후회",
  "답답",
  "막막",
  "스트레스",
  "무서",
  "두려",
  "괴로",
  "고통",
  "열받",
  "우울해",
  "힘들어",
  "짜증나",
  "싫다",
  "못하",
  "안돼",
  "sad",
  "angry",
  "hate",
  "fail",
  "tired",
  "stress",
  "lonely",
  "awful",
  "bad",
  "depressed",
];

const MAX_HP = 100;
const HP_GAIN = 15;
const HP_LOSS = 18;
const LEVEL_UP_THRESHOLD = MAX_HP;

type Sentiment = "positive" | "negative" | "neutral";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
  tone?: Sentiment;
};

type PlantFx = "float" | "shake" | "bloom" | "wilt";

function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  const pos = POSITIVE_WORDS.some((w) => t.includes(w));
  const neg = NEGATIVE_WORDS.some((w) => t.includes(w));
  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  return "neutral";
}

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** HP·레벨에 따라 식물 이모지 결정 */
function getPlantEmoji(hp: number, level: number): string {
  if (hp === 0) return "🪦";
  if (hp <= 25) return "🥀";
  if (hp <= 50) return "🌱";
  if (hp <= 75) return "🌿";
  if (level >= 3) return "🌳";
  return "🌸";
}

function getPlantStatus(hp: number, level: number): string {
  if (hp === 0) return "식물이 시들었어요… 긍정의 말로 다시 심어 주세요";
  if (hp <= 25) return "마음이 무거워요… 따뜻한 말이 필요해요";
  if (hp <= 50) return "작은 새싹이 고개를 들었어요";
  if (hp <= 75) return "무럭무럭 자라는 중이에요";
  if (level >= 3) return "우당탕 마음 나무가 자랐어요!";
  return "활짝 꽃이 피었어요!";
}

const BOT = {
  welcome:
    "안녕하세요 🌱 긍정의 말을 해주면 식물이 자라요. 힘든 감정도 편하게 내려놓으세요.",
  positive: [
    "그 말이 햇빛이 되었어요! 식물이 기뻐하고 있어요 ☀️",
    "정말 좋은 에너지예요. 조금씩 자라고 있어요!",
    "긍정의 씨앗이 싹을 틔웠어요 🌿",
    "당신의 따뜻한 말이 꽃봉오리를 키우고 있어요.",
    "오늘도 잘하고 있어요. 식물이 미소 짓고 있어요 😊",
  ],
  negative: [
    "힘든 마음도 괜찮아요. 여기에 쏟아내 보세요 🫂",
    "그 감정, 화분이 대신 받아줄게요.",
    "비가 내린 뒤엔 무지개가 떠요. 천천히 숨 고르세요 🌈",
    "부정적인 감정을 꺼내는 것도 치유의 시작이에요.",
    "울어도 괜찮아요. 이 정원은 당신 편이에요.",
  ],
  neutral: [
    "어떤 감정이든 괜찮아요. 편하게 이야기해 주세요.",
    "긍정의 말은 성장, 부정의 말도 받아줄게요.",
    "천천히 적어 보세요. 식물이 듣고 있어요.",
  ],
  levelUp: [
    "레벨 업! 🎉 마음 정원이 더 넓어졌어요!",
    "새 단계 달성! 식물이 한 단계 진화했어요 ✨",
    "축하해요! 당신의 마음 씨앗이 더 단단해졌어요 🌳",
  ],
  revived: [
    "다시 싹이 돋았어요! 새로운 시작이에요 🌱",
    "죽었다가 다시 피는 꽃처럼, 당신도 할 수 있어요.",
  ],
};

const QUICK_HINTS = ["오늘도 잘했어", "힘들어", "감사해", "행복해"];

export default function Home() {
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(50);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: BOT.welcome },
  ]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const [plantFx, setPlantFx] = useState<PlantFx>("float");
  const [hpGlow, setHpGlow] = useState<"none" | "up" | "down">("none");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function playFx(kind: PlantFx) {
    setPlantFx(kind);
    const ms = kind === "shake" || kind === "wilt" ? 600 : 700;
    setTimeout(() => setPlantFx("float"), ms);
  }

  function flashHpGlow(dir: "up" | "down") {
    setHpGlow(dir);
    setTimeout(() => setHpGlow("none"), 800);
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const tone = detectSentiment(text);
    const batch: Message[] = [{ id: nextId, from: "user", text, tone }];
    let id = nextId + 1;

    let newHp = hp;
    let newLevel = level;
    const wasDead = hp === 0;

    if (tone === "positive") {
      const gain = wasDead ? HP_GAIN + 10 : HP_GAIN;
      newHp = Math.min(MAX_HP, hp + gain);
      flashHpGlow("up");
      playFx(wasDead ? "bloom" : newHp >= MAX_HP ? "bloom" : "float");

      batch.push({
        id: id++,
        from: "bot",
        text: wasDead ? randomOf(BOT.revived) : randomOf(BOT.positive),
        tone: "positive",
      });

      if (newHp >= LEVEL_UP_THRESHOLD) {
        newLevel = level + 1;
        newHp = 40;
        batch.push({
          id: id++,
          from: "bot",
          text: randomOf(BOT.levelUp),
          tone: "positive",
        });
      }
    } else if (tone === "negative") {
      newHp = Math.max(0, hp - HP_LOSS);
      flashHpGlow("down");
      playFx(newHp === 0 ? "wilt" : "shake");
      batch.push({
        id: id++,
        from: "bot",
        text: randomOf(BOT.negative),
        tone: "negative",
      });
    } else {
      batch.push({
        id: id++,
        from: "bot",
        text: randomOf(BOT.neutral),
        tone: "neutral",
      });
    }

    setHp(newHp);
    setLevel(newLevel);
    setMessages((prev) => [...prev, ...batch]);
    setNextId(id);
    setInput("");
    inputRef.current?.focus();
  }

  function sendHint(hint: string) {
    setInput(hint);
    inputRef.current?.focus();
  }

  const plant = getPlantEmoji(hp, level);
  const hpPercent = Math.round((hp / MAX_HP) * 100);
  const barColor =
    hp === 0
      ? "#b5aea3"
      : hp <= 25
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
        @keyframes heal-sparkle {
          0%, 100% { opacity: 0.35; transform: scale(0.85) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(12deg); }
        }
        @keyframes heal-pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .plant-float { animation: heal-float 3.4s ease-in-out infinite; }
        .plant-shake { animation: heal-shake 0.55s ease-in-out; }
        .plant-bloom { animation: heal-bloom 0.75s ease-out; }
        .plant-wilt { animation: heal-wilt 0.6s ease-in forwards; }
        .deco-sparkle { animation: heal-sparkle 2.6s ease-in-out infinite; }
        .hp-glow-up { box-shadow: 0 0 18px 4px rgba(156, 175, 136, 0.45); }
        .hp-glow-down { box-shadow: 0 0 18px 4px rgba(232, 165, 152, 0.5); }
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
          {/* ── 상단: 레벨 & HP ── */}
          <header className="shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8ba4b4]">
                  HEALING GARDEN
                </p>
                <h1 className="text-xl font-bold text-[#4a5248] sm:text-2xl">
                  마음의 화분
                </h1>
              </div>
              <div className="rounded-2xl border border-[#e8dcc8] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#e8a598]">
                  Level
                </p>
                <p className="text-2xl font-bold text-[#6d8a5e]">Lv.{level}</p>
              </div>
            </div>

            <div
              className={`rounded-2xl border border-[#e8e0d4] bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-shadow duration-500 ${
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
              <p className="mt-2 text-center text-[11px] text-[#8ba4b4]">
                긍정어 +{HP_GAIN} · 부정어 −{HP_LOSS}
              </p>
            </div>
          </header>

          {/* ── 중앙: 둥실둥실 화분 ── */}
          <main className="flex flex-1 flex-col items-center justify-center py-5 sm:py-8">
            <div className="relative flex flex-col items-center">
              <span
                className="deco-sparkle absolute -left-6 top-0 text-lg sm:-left-10 sm:text-xl"
                aria-hidden
              >
                ✨
              </span>
              <span
                className="deco-sparkle absolute -right-4 top-12 text-base sm:-right-8 sm:text-lg"
                style={{ animationDelay: "1.1s" }}
                aria-hidden
              >
                🍃
              </span>
              <span
                className="deco-sparkle absolute left-1/2 -top-4 -translate-x-1/2 text-sm"
                style={{ animationDelay: "0.5s" }}
                aria-hidden
              >
                💫
              </span>

              {/* 식물 이모지 */}
              <div
                className={`select-none text-[5.5rem] leading-none sm:text-[7.5rem] ${
                  plantFx === "shake"
                    ? "plant-shake"
                    : plantFx === "bloom"
                      ? "plant-bloom"
                      : plantFx === "wilt"
                        ? "plant-wilt"
                        : "plant-float"
                }`}
                role="img"
                aria-label={getPlantStatus(hp, level)}
              >
                {plant}
              </div>

              {/* 화분 */}
              <div className="plant-float -mt-2 select-none text-[3.5rem] opacity-90 sm:text-5xl">
                🪴
              </div>

              <p className="mt-4 max-w-[260px] rounded-full border border-[#e8dcc8] bg-white/70 px-5 py-2 text-center text-sm font-medium text-[#6d8a5e] shadow-sm sm:max-w-xs">
                {getPlantStatus(hp, level)}
              </p>
            </div>
          </main>

          {/* ── 하단: 채팅창 ── */}
          <footer className="shrink-0 overflow-hidden rounded-3xl border border-[#e8e0d4] bg-white/90 shadow-lg backdrop-blur-md">
            <div className="border-b border-[#ede8df] bg-gradient-to-r from-[#f5f0e8]/80 to-white/60 px-4 py-3">
              <p className="text-sm font-semibold text-[#4a5248]">
                마음 쓰레기통{" "}
                <span className="text-[#e8a598]">💬</span>
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
              <div ref={chatEndRef} />
            </div>

            {/* 빠른 입력 힌트 */}
            <div className="flex flex-wrap gap-1.5 border-t border-[#ede8df]/60 px-3 py-2">
              {QUICK_HINTS.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => sendHint(hint)}
                  className="rounded-full border border-[#e8dcc8] bg-[#FDFBF7] px-3 py-1 text-[11px] font-medium text-[#6d8a5e] transition hover:border-[#9caf88] hover:bg-[#9caf88]/10 active:scale-95 sm:text-xs"
                >
                  {hint}
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
                disabled={!input.trim()}
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
