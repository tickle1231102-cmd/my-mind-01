"use client";

import { useEffect, useRef, useState } from "react";

type RootCharacterProps = {
  level: number;
  /** 0~100 뿌리 HP — 굵기·깊이 보조 */
  hpPercent?: number;
  growing?: boolean;
  className?: string;
};

/**
 * 뿌리 강화 모드용 캐릭터.
 * 지상 새싹 + 지하 뿌리가 레벨에 따라 깊고 풍성하게 자람.
 */
export function RootCharacter({
  level,
  hpPercent = 0,
  growing = false,
  className = "",
}: RootCharacterProps) {
  const stage = Math.max(0, Math.min(level, 5));
  const [growPulse, setGrowPulse] = useState(false);
  const prevLevelRef = useRef(level);
  const prevGrowingRef = useRef(growing);

  useEffect(() => {
    if (level > prevLevelRef.current || (growing && !prevGrowingRef.current)) {
      setGrowPulse(true);
      const t = window.setTimeout(() => setGrowPulse(false), 950);
      prevLevelRef.current = level;
      prevGrowingRef.current = growing;
      return () => window.clearTimeout(t);
    }
    prevLevelRef.current = level;
    prevGrowingRef.current = growing;
  }, [level, growing]);

  const depthBoost = 0.15 + (hpPercent / 100) * 0.25;

  return (
    <div
      className={`root-character ${growPulse ? "root-char-growing" : ""} ${className}`}
      data-stage={stage}
      style={{ ["--root-depth" as string]: String(depthBoost) }}
      aria-hidden
    >
      <style>{`
        .root-character {
          width: 100%;
          max-width: 240px;
          margin: 0 auto;
          filter: drop-shadow(0 6px 12px rgba(62, 52, 42, 0.16));
        }
        .root-char-svg { width: 100%; height: auto; overflow: visible; display: block; }

        .rc-stem, .rc-leaf, .rc-root, .rc-root-tip {
          transition: transform 0.75s cubic-bezier(0.34, 1.35, 0.64, 1),
            opacity 0.55s ease, stroke-dashoffset 0.9s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .rc-stem { transform-box: fill-box; transform-origin: center bottom; }
        .rc-leaf { transform-box: fill-box; transform-origin: center center; }
        .rc-root-g { transform-box: fill-box; transform-origin: 80px 58px; }

        /* draw-on roots */
        .rc-root {
          stroke-dasharray: 120;
          stroke-dashoffset: 40;
        }
        .root-character[data-stage="0"] .rc-root { stroke-dashoffset: 70; }
        .root-character[data-stage="1"] .rc-root { stroke-dashoffset: 45; }
        .root-character[data-stage="2"] .rc-root { stroke-dashoffset: 28; }
        .root-character[data-stage="3"] .rc-root { stroke-dashoffset: 14; }
        .root-character[data-stage="4"] .rc-root,
        .root-character[data-stage="5"] .rc-root { stroke-dashoffset: 0; }

        .rc-branch { opacity: 0; transform: scale(0.2); transform-box: fill-box; transform-origin: center top; transition: transform 0.7s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.5s ease; }
        .root-character[data-stage="0"] .rc-stem { transform: scaleY(0.55); }
        .root-character[data-stage="0"] .rc-leaf-l,
        .root-character[data-stage="0"] .rc-leaf-r { opacity: 0.75; transform: scale(0.7); }

        .root-character[data-stage="1"] .rc-stem { transform: scaleY(0.7); }
        .root-character[data-stage="1"] .rc-leaf-l,
        .root-character[data-stage="1"] .rc-leaf-r { opacity: 1; transform: scale(0.88); }
        .root-character[data-stage="1"] .rc-branch-a { opacity: 0.85; transform: scale(0.85); }

        .root-character[data-stage="2"] .rc-stem { transform: scaleY(0.85); }
        .root-character[data-stage="2"] .rc-leaf-l,
        .root-character[data-stage="2"] .rc-leaf-r { opacity: 1; transform: scale(1); }
        .root-character[data-stage="2"] .rc-branch-a,
        .root-character[data-stage="2"] .rc-branch-b { opacity: 1; transform: scale(1); }

        .root-character[data-stage="3"] .rc-stem { transform: scaleY(0.95); }
        .root-character[data-stage="3"] .rc-leaf-l,
        .root-character[data-stage="3"] .rc-leaf-r,
        .root-character[data-stage="3"] .rc-leaf-top { opacity: 1; transform: scale(1); }
        .root-character[data-stage="3"] .rc-branch-a,
        .root-character[data-stage="3"] .rc-branch-b,
        .root-character[data-stage="3"] .rc-branch-c { opacity: 1; transform: scale(1); }

        .root-character[data-stage="4"] .rc-stem,
        .root-character[data-stage="5"] .rc-stem { transform: scaleY(1); }
        .root-character[data-stage="4"] .rc-leaf-l,
        .root-character[data-stage="4"] .rc-leaf-r,
        .root-character[data-stage="4"] .rc-leaf-top,
        .root-character[data-stage="5"] .rc-leaf-l,
        .root-character[data-stage="5"] .rc-leaf-r,
        .root-character[data-stage="5"] .rc-leaf-top { opacity: 1; transform: scale(1); }
        .root-character[data-stage="4"] .rc-branch-a,
        .root-character[data-stage="4"] .rc-branch-b,
        .root-character[data-stage="4"] .rc-branch-c,
        .root-character[data-stage="4"] .rc-branch-d,
        .root-character[data-stage="5"] .rc-branch-a,
        .root-character[data-stage="5"] .rc-branch-b,
        .root-character[data-stage="5"] .rc-branch-c,
        .root-character[data-stage="5"] .rc-branch-d { opacity: 1; transform: scale(1); }

        .rc-leaf-top { opacity: 0; transform: scale(0.2); }

        .rc-root-g {
          transform: scaleY(calc(0.72 + var(--root-depth, 0.2)));
        }
        .root-character[data-stage="0"] .rc-root-g { transform: scaleY(0.55); }
        .root-character[data-stage="1"] .rc-root-g { transform: scaleY(calc(0.68 + var(--root-depth, 0.15))); }
        .root-character[data-stage="2"] .rc-root-g { transform: scaleY(calc(0.8 + var(--root-depth, 0.18))); }
        .root-character[data-stage="3"] .rc-root-g { transform: scaleY(calc(0.9 + var(--root-depth, 0.2))); }
        .root-character[data-stage="4"] .rc-root-g,
        .root-character[data-stage="5"] .rc-root-g { transform: scaleY(calc(1 + var(--root-depth, 0.22) * 0.35)); }

        @keyframes root-char-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes root-char-grow {
          0% { transform: scale(1); }
          35% { transform: scale(1.06); }
          70% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        @keyframes root-sparkle {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes root-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 96% { transform: scaleY(0.12); }
        }
        .root-character { animation: root-char-float 3.6s ease-in-out infinite; }
        .root-char-growing { animation: root-char-grow 0.95s cubic-bezier(0.34, 1.4, 0.64, 1); }
        .root-char-growing .rc-sparkle { animation: root-sparkle 0.95s ease-out both; }
        .rc-blink { transform-origin: center; animation: root-blink 4.8s ease-in-out infinite; }
      `}</style>

      <svg
        className="root-char-svg"
        viewBox="0 0 160 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rcSoil" x1="0" y1="58" x2="0" y2="148">
            <stop offset="0%" stopColor="#d4c4b0" />
            <stop offset="55%" stopColor="#b8a48c" />
            <stop offset="100%" stopColor="#9a8670" />
          </linearGradient>
          <linearGradient id="rcPot" x1="50" y1="42" x2="110" y2="62">
            <stop offset="0%" stopColor="#d4b896" />
            <stop offset="100%" stopColor="#c4a882" />
          </linearGradient>
          <radialGradient id="rcGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#9caf88" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9caf88" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 지상 하늘빛 */}
        <rect x="0" y="0" width="160" height="58" fill="#f5f0e8" />
        <ellipse cx="80" cy="58" rx="70" ry="18" fill="url(#rcGlow)" />

        {/* sparkles */}
        <g className="rc-sparkle" opacity="0">
          <circle cx="38" cy="22" r="2" fill="#f0d878" />
          <circle cx="118" cy="18" r="1.6" fill="#fff1a8" />
          <circle cx="96" cy="88" r="1.8" fill="#c5d4b0" />
        </g>

        {/* 지상 식물 */}
        <g className="rc-plant">
          <g className="rc-stem">
            <path
              d="M80 50 C79 40 79 30 80 20"
              stroke="#7a9168"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
          <g className="rc-leaf rc-leaf-l">
            <ellipse
              cx="68"
              cy="32"
              rx="11"
              ry="6.5"
              fill="#9caf88"
              transform="rotate(-32 68 32)"
            />
          </g>
          <g className="rc-leaf rc-leaf-r">
            <ellipse
              cx="92"
              cy="30"
              rx="11"
              ry="6.5"
              fill="#8fad7a"
              transform="rotate(34 92 30)"
            />
          </g>
          <g className="rc-leaf rc-leaf-top">
            <ellipse
              cx="80"
              cy="18"
              rx="7"
              ry="4.5"
              fill="#b5c9a0"
              transform="rotate(-8 80 18)"
            />
          </g>
          {/* tiny face on sprout tip */}
          <g opacity={stage >= 2 ? 0.85 : 0.5}>
            <ellipse className="rc-blink" cx="77.2" cy="22" rx="0.9" ry="1.05" fill="#5a4638" />
            <ellipse className="rc-blink" cx="82.8" cy="22" rx="0.9" ry="1.05" fill="#5a4638" />
            <path
              d="M78 24.2c1 1 3 1 4 0"
              stroke="#5a4638"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* 화분 윗부분 */}
        <g className="rc-pot">
          <ellipse cx="80" cy="50" rx="18" ry="4" fill="#a88968" />
          <path d="M64 50 L67 62 Q80 66 93 62 L96 50 Z" fill="url(#rcPot)" />
          <rect x="62" y="47" width="36" height="6.5" rx="2.5" fill="#d4b896" />
          <ellipse cx="80" cy="47.5" rx="18" ry="3.5" fill="#8a6f52" />
          <ellipse cx="80" cy="46.5" rx="12" ry="2.2" fill="#5c4a3a" opacity="0.45" />
        </g>

        {/* 지면 라인 */}
        <path
          d="M8 58 Q80 54 152 58"
          stroke="#b8a894"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* 지하 흙 */}
        <path
          d="M0 58 L160 58 L160 150 L0 150 Z"
          fill="url(#rcSoil)"
        />
        {/* soil texture dots */}
        <circle cx="28" cy="78" r="1.2" fill="#a89884" opacity="0.35" />
        <circle cx="120" cy="92" r="1.4" fill="#a89884" opacity="0.3" />
        <circle cx="48" cy="118" r="1.1" fill="#a89884" opacity="0.28" />
        <circle cx="132" cy="128" r="1.3" fill="#a89884" opacity="0.32" />

        {/* 뿌리 — 중앙 기준 아래로 성장 */}
        <g className="rc-root-g">
          {/* main taproot */}
          <path
            className="rc-root"
            d="M80 58 C78 78 76 98 74 122"
            stroke="#5a6b4a"
            strokeWidth={2.8 + stage * 0.35}
            strokeLinecap="round"
            fill="none"
          />
          {/* left primary */}
          <path
            className="rc-root"
            d="M80 62 C70 78 58 92 42 108"
            stroke="#5a6b4a"
            strokeWidth={2.2 + stage * 0.25}
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          {/* right primary */}
          <path
            className="rc-root"
            d="M80 62 C90 80 104 94 122 110"
            stroke="#5a6b4a"
            strokeWidth={2.2 + stage * 0.25}
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />

          {/* branches appear by stage */}
          <g className="rc-branch rc-branch-a">
            <path
              d="M72 86 C60 92 50 96 38 100"
              stroke="#4a5a3c"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="38" cy="100" r="2.2" fill="#6d8a5e" opacity="0.55" />
          </g>
          <g className="rc-branch rc-branch-b">
            <path
              d="M88 90 C102 98 114 104 128 112"
              stroke="#4a5a3c"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="128" cy="112" r="2.2" fill="#6d8a5e" opacity="0.55" />
          </g>
          <g className="rc-branch rc-branch-c">
            <path
              d="M76 104 C64 112 52 120 40 128"
              stroke="#4a5a3c"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="40" cy="128" r="2" fill="#8fad7a" opacity="0.5" />
          </g>
          <g className="rc-branch rc-branch-d">
            <path
              d="M84 108 C98 118 112 126 126 134"
              stroke="#4a5a3c"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="126" cy="134" r="2" fill="#8fad7a" opacity="0.5" />
            {/* deep tips for high levels */}
            <path
              d="M74 122 C70 132 66 138 60 142 M74 122 C80 134 86 140 94 144"
              stroke="#3d4a32"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
