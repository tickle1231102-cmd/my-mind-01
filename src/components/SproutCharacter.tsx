"use client";

import { useEffect, useRef, useState } from "react";

export type SproutFx = "float" | "shake" | "bloom" | "wilt";

type SproutCharacterProps = {
  level: number;
  fx?: SproutFx;
  wilted?: boolean;
  className?: string;
};

/**
 * 코드로 그린 귀여운 새싹 캐릭터.
 * Lv0 씨앗 → Lv1 새싹 → Lv2 잎 → Lv3 줄기 → Lv4 봉오리 → Lv5+ 꽃
 */
export function SproutCharacter({
  level,
  fx = "float",
  wilted = false,
  className = "",
}: SproutCharacterProps) {
  const stage = Math.max(0, Math.min(level, 5));
  const [growing, setGrowing] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setGrowing(true);
      const t = window.setTimeout(() => setGrowing(false), 900);
      prevLevelRef.current = level;
      return () => window.clearTimeout(t);
    }
    prevLevelRef.current = level;
  }, [level]);

  const fxClass =
    fx === "shake"
      ? "sprout-fx-shake"
      : fx === "bloom"
        ? "sprout-fx-bloom"
        : fx === "wilt"
          ? "sprout-fx-wilt"
          : "sprout-fx-float";

  const toneClass = wilted ? "sprout-tone-wilt" : "";

  return (
    <div
      className={`sprout-character ${fxClass} ${toneClass} ${growing ? "sprout-growing" : ""} ${className}`}
      data-stage={stage}
      aria-hidden
    >
      <style>{`
        .sprout-character {
          width: 5.75rem;
          height: 7rem;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          filter: drop-shadow(0 8px 14px rgba(62, 52, 42, 0.18));
          transition: filter 0.5s ease, opacity 0.45s ease;
        }
        @media (min-width: 640px) {
          .sprout-character {
            width: 6.5rem;
            height: 7.75rem;
          }
        }
        .sprout-character[data-stage="0"] {
          width: 3.85rem;
          height: 3.85rem;
          align-items: center;
        }
        @media (min-width: 640px) {
          .sprout-character[data-stage="0"] {
            width: 4.35rem;
            height: 4.35rem;
          }
        }
        .sprout-tone-wilt {
          filter: grayscale(0.45) saturate(0.65) brightness(0.95) drop-shadow(0 8px 14px rgba(62, 52, 42, 0.14));
          opacity: 0.78;
        }
        .sprout-svg { width: 100%; height: 100%; overflow: visible; }

        .sprout-character[data-stage="0"] .sc-plant,
        .sprout-character[data-stage="0"] .sc-pot { display: none; }
        .sprout-character:not([data-stage="0"]) .sc-seed-wrap { display: none; }

        .sc-stem-g, .sc-leaf-g, .sc-crown-g {
          transform-box: fill-box;
          transform-origin: center bottom;
          transition: transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.45s ease;
        }
        .sc-leaf-g { transform-origin: center center; }
        .sc-crown-g { transform-origin: center center; }

        .sc-stem-g { transform: scaleY(0.4); opacity: 0.85; }
        .sc-leaf-l1, .sc-leaf-r1,
        .sc-leaf-l2, .sc-leaf-r2,
        .sc-leaf-top { opacity: 0; transform: scale(0.15); }
        .sc-bud-g, .sc-flower-g, .sc-fruit-g { opacity: 0; transform: scale(0.12); }

        .sprout-character[data-stage="1"] .sc-stem-g { transform: scaleY(0.55); opacity: 1; }
        .sprout-character[data-stage="1"] .sc-leaf-l1,
        .sprout-character[data-stage="1"] .sc-leaf-r1 { opacity: 1; transform: scale(0.88); }

        .sprout-character[data-stage="2"] .sc-stem-g { transform: scaleY(0.72); opacity: 1; }
        .sprout-character[data-stage="2"] .sc-leaf-l1,
        .sprout-character[data-stage="2"] .sc-leaf-r1 { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="2"] .sc-leaf-l2,
        .sprout-character[data-stage="2"] .sc-leaf-r2 { opacity: 1; transform: scale(0.92); }

        .sprout-character[data-stage="3"] .sc-stem-g { transform: scaleY(0.9); opacity: 1; }
        .sprout-character[data-stage="3"] .sc-leaf-l1,
        .sprout-character[data-stage="3"] .sc-leaf-r1,
        .sprout-character[data-stage="3"] .sc-leaf-l2,
        .sprout-character[data-stage="3"] .sc-leaf-r2,
        .sprout-character[data-stage="3"] .sc-leaf-top { opacity: 1; transform: scale(1); }

        .sprout-character[data-stage="4"] .sc-stem-g { transform: scaleY(1); opacity: 1; }
        .sprout-character[data-stage="4"] .sc-leaf-l1,
        .sprout-character[data-stage="4"] .sc-leaf-r1,
        .sprout-character[data-stage="4"] .sc-leaf-l2,
        .sprout-character[data-stage="4"] .sc-leaf-r2,
        .sprout-character[data-stage="4"] .sc-leaf-top { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="4"] .sc-bud-g { opacity: 1; transform: scale(1); }

        .sprout-character[data-stage="5"] .sc-stem-g { transform: scaleY(1); opacity: 1; }
        .sprout-character[data-stage="5"] .sc-leaf-l1,
        .sprout-character[data-stage="5"] .sc-leaf-r1,
        .sprout-character[data-stage="5"] .sc-leaf-l2,
        .sprout-character[data-stage="5"] .sc-leaf-r2,
        .sprout-character[data-stage="5"] .sc-leaf-top { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="5"] .sc-bud-g { opacity: 0; transform: scale(0.2); }
        .sprout-character[data-stage="5"] .sc-flower-g { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="5"] .sc-fruit-g { opacity: 1; transform: scale(1); }

        @keyframes sprout-float {
          0%, 100% { transform: translateY(0) rotate(-1.2deg); }
          50% { transform: translateY(-10px) rotate(1.2deg); }
        }
        @keyframes sprout-shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-8px) rotate(-5deg); }
          40% { transform: translateX(8px) rotate(5deg); }
          60% { transform: translateX(-5px) rotate(-3deg); }
          80% { transform: translateX(5px) rotate(3deg); }
        }
        @keyframes sprout-bloom {
          0% { transform: scale(1); }
          40% { transform: scale(1.14); }
          100% { transform: scale(1); }
        }
        @keyframes sprout-wilt {
          0% { transform: rotate(0) scale(1); }
          100% { transform: rotate(10deg) scale(0.92); }
        }
        @keyframes sprout-grow-pop {
          0% { transform: scale(1); }
          35% { transform: scale(1.12); }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        @keyframes sprout-sparkle {
          0% { opacity: 0; }
          35% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sprout-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 96% { transform: scaleY(0.12); }
        }
        .sprout-fx-float { animation: sprout-float 3.4s ease-in-out infinite; }
        .sprout-fx-shake { animation: sprout-shake 0.55s ease-in-out; }
        .sprout-fx-bloom { animation: sprout-bloom 0.75s ease-out; }
        .sprout-fx-wilt { animation: sprout-wilt 0.6s ease-in forwards; }
        .sprout-growing { animation: sprout-grow-pop 0.9s cubic-bezier(0.34, 1.4, 0.64, 1); }
        .sprout-growing .sc-sparkle { animation: sprout-sparkle 0.9s ease-out both; }
        .sc-blink { transform-origin: center; animation: sprout-blink 4.5s ease-in-out infinite; }
      `}</style>

      <svg
        className="sprout-svg"
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="seedGloss" x1="35" y1="30" x2="65" y2="75">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#d4a574" stopOpacity="0" />
            <stop offset="100%" stopColor="#b8864e" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="potShade" x1="30" y1="80" x2="70" y2="105">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8a6b4a" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Lv0 씨앗 */}
        <g className="sc-seed-wrap">
          <ellipse cx="50" cy="78" rx="18" ry="5" fill="#c4a882" opacity="0.28" />
          <ellipse cx="50" cy="54" rx="23" ry="27" fill="#d4a574" />
          <ellipse cx="50" cy="54" rx="23" ry="27" fill="url(#seedGloss)" />
          <path
            d="M50 29c-2.2 8.5-2.2 17 0 25.5c2.2-8.5 2.2-17 0-25.5Z"
            fill="#c4925e"
            opacity="0.5"
          />
          <ellipse cx="41" cy="45" rx="6.5" ry="4" fill="#fff" opacity="0.35" />
          <ellipse className="sc-blink" cx="41.5" cy="54" rx="2.3" ry="2.8" fill="#5a4638" />
          <ellipse className="sc-blink" cx="58.5" cy="54" rx="2.3" ry="2.8" fill="#5a4638" />
          <path
            d="M44.5 62c2.2 2.6 8.8 2.6 11 0"
            stroke="#5a4638"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="35" cy="58" r="2.3" fill="#e8a598" opacity="0.75" />
          <circle cx="65" cy="58" r="2.3" fill="#e8a598" opacity="0.75" />
        </g>

        {/* Lv1+ 식물 */}
        <g className="sc-plant">
          <g className="sc-sparkle" opacity="0">
            <circle cx="24" cy="28" r="2.1" fill="#f0d878" />
            <circle cx="76" cy="22" r="1.8" fill="#fff1a8" />
            <circle cx="68" cy="40" r="1.5" fill="#f0d878" />
          </g>

          <g className="sc-stem-g">
            <path
              d="M50 78 C48.8 64 48.8 50 50 34"
              stroke="#7a9168"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          </g>

          <g className="sc-leaf-g sc-leaf-l1">
            <ellipse
              cx="35"
              cy="58"
              rx="13"
              ry="7.5"
              fill="#9caf88"
              transform="rotate(-30 35 58)"
            />
            <path
              d="M35 58c3-1 7-1 10 0"
              stroke="#7a9168"
              strokeWidth="0.8"
              opacity="0.35"
              transform="rotate(-30 35 58)"
            />
          </g>
          <g className="sc-leaf-g sc-leaf-r1">
            <ellipse
              cx="65"
              cy="56"
              rx="13"
              ry="7.5"
              fill="#8fad7a"
              transform="rotate(32 65 56)"
            />
          </g>
          <g className="sc-leaf-g sc-leaf-l2">
            <ellipse
              cx="31"
              cy="44"
              rx="12"
              ry="7"
              fill="#a8be92"
              transform="rotate(-42 31 44)"
            />
          </g>
          <g className="sc-leaf-g sc-leaf-r2">
            <ellipse
              cx="69"
              cy="42"
              rx="12"
              ry="7"
              fill="#9caf88"
              transform="rotate(40 69 42)"
            />
          </g>
          <g className="sc-leaf-g sc-leaf-top">
            <ellipse
              cx="50"
              cy="36"
              rx="8.5"
              ry="5.5"
              fill="#b5c9a0"
              transform="rotate(-6 50 36)"
            />
          </g>

          <g className="sc-crown-g sc-bud-g">
            <ellipse cx="50" cy="26" rx="7.5" ry="9.5" fill="#e8a598" />
            <ellipse cx="50" cy="23.5" rx="4.2" ry="5.2" fill="#f0b8ac" opacity="0.85" />
            <path d="M50 17.5v6" stroke="#7a9168" strokeWidth="1.6" strokeLinecap="round" />
          </g>

          <g className="sc-crown-g sc-flower-g">
            <circle cx="50" cy="21" r="5.8" fill="#f3c4b8" />
            <circle cx="42.5" cy="26" r="5.2" fill="#e8a598" />
            <circle cx="57.5" cy="26" r="5.2" fill="#e8a598" />
            <circle cx="44.5" cy="17.5" r="4.8" fill="#f0b8ac" />
            <circle cx="55.5" cy="17.5" r="4.8" fill="#f0b8ac" />
            <circle cx="50" cy="23" r="3.4" fill="#f5e6a8" />
            <ellipse className="sc-blink" cx="47.6" cy="22.8" rx="0.95" ry="1.1" fill="#5a4638" />
            <ellipse className="sc-blink" cx="52.4" cy="22.8" rx="0.95" ry="1.1" fill="#5a4638" />
            <path
              d="M48.4 25.2c1 1.1 2.6 1.1 3.6 0"
              stroke="#5a4638"
              strokeWidth="0.85"
              strokeLinecap="round"
            />
          </g>

          <g className="sc-crown-g sc-fruit-g">
            <circle cx="37" cy="34" r="3.1" fill="#e8a598" />
            <circle cx="64" cy="36" r="2.7" fill="#d4847c" opacity="0.9" />
          </g>
        </g>

        {/* 화분 */}
        <g className="sc-pot">
          <ellipse cx="50" cy="80" rx="23" ry="5" fill="#b8956e" />
          <path d="M29 80 L33.5 102.5 Q50 109 66.5 102.5 L71 80 Z" fill="#c4a882" />
          <path d="M29 80 L33.5 102.5 Q50 109 66.5 102.5 L71 80 Z" fill="url(#potShade)" />
          <rect x="27" y="76" width="46" height="8.5" rx="3.2" fill="#d4b896" />
          <ellipse cx="50" cy="76" rx="23" ry="4.6" fill="#a88968" />
          <ellipse cx="50" cy="75" rx="16.5" ry="3.1" fill="#6d5a48" opacity="0.55" />
          <ellipse cx="50" cy="74" rx="12" ry="2.4" fill="#5c4a3a" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
