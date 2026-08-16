"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PlantMood } from "@/lib/sentiment";
import type { PotSkinId } from "@/lib/store-catalog";
import { POT_SKIN_COLORS } from "@/components/PotSkinPreview";

export type SproutFx = "float" | "shake" | "bloom" | "wilt";

type SproutCharacterProps = {
  level: number;
  fx?: SproutFx;
  wilted?: boolean;
  mood?: PlantMood;
  /** 같은 mood를 연속 재생할 때 하트/눈물 애니메이션 리셋용 */
  moodPulse?: number;
  potSkinId?: PotSkinId | string;
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
  mood = "none",
  moodPulse = 0,
  potSkinId = "default",
  className = "",
}: SproutCharacterProps) {
  const stage = Math.max(0, Math.min(level, 5));
  const [growing, setGrowing] = useState(false);
  const prevLevelRef = useRef(level);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      setGrowing(true);
      const t = window.setTimeout(() => setGrowing(false), 1100);
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
  const moodClass =
    mood === "cry"
      ? "sprout-mood-cry"
      : mood === "angry"
        ? "sprout-mood-angry"
        : mood === "love"
          ? "sprout-mood-love"
          : "";

  const skin = POT_SKIN_COLORS[potSkinId as PotSkinId] ?? POT_SKIN_COLORS.default;
  const skinStyle = {
    "--pot-body": skin.body,
    "--pot-rim": skin.rim,
    "--pot-rim-dark": skin.rimDark,
    "--pot-soil": skin.soil,
    "--pot-shadow": skin.shadow,
    "--pot-accent": skin.accent ?? skin.rimDark,
  } as CSSProperties;

  return (
    <div
      className={`sprout-character ${fxClass} ${toneClass} ${moodClass} ${growing ? "sprout-growing" : ""} ${className}`}
      data-stage={stage}
      data-mood={mood}
      data-pot-skin={potSkinId}
      style={skinStyle}
      aria-hidden
    >
      <style>{`
        .sprout-character {
          position: relative;
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
        .sc-head-face { opacity: 0; transform: scale(0.2); transform-box: fill-box; transform-origin: center center; transition: transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.45s ease; }
        .sc-bud-face, .sc-flower-face { opacity: 0; }

        .sprout-character[data-stage="1"] .sc-stem-g { transform: scaleY(0.55); opacity: 1; }
        .sprout-character[data-stage="1"] .sc-leaf-l1,
        .sprout-character[data-stage="1"] .sc-leaf-r1 { opacity: 1; transform: scale(0.88); }
        .sprout-character[data-stage="1"] .sc-head-face { opacity: 1; transform: scale(0.92) translateY(4px); }

        .sprout-character[data-stage="2"] .sc-stem-g { transform: scaleY(0.72); opacity: 1; }
        .sprout-character[data-stage="2"] .sc-leaf-l1,
        .sprout-character[data-stage="2"] .sc-leaf-r1 { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="2"] .sc-leaf-l2,
        .sprout-character[data-stage="2"] .sc-leaf-r2 { opacity: 1; transform: scale(0.92); }
        .sprout-character[data-stage="2"] .sc-head-face { opacity: 1; transform: scale(1) translateY(0); }

        .sprout-character[data-stage="3"] .sc-stem-g { transform: scaleY(0.9); opacity: 1; }
        .sprout-character[data-stage="3"] .sc-leaf-l1,
        .sprout-character[data-stage="3"] .sc-leaf-r1,
        .sprout-character[data-stage="3"] .sc-leaf-l2,
        .sprout-character[data-stage="3"] .sc-leaf-r2,
        .sprout-character[data-stage="3"] .sc-leaf-top { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="3"] .sc-head-face { opacity: 1; transform: scale(1.05) translateY(-2px); }

        .sprout-character[data-stage="4"] .sc-stem-g { transform: scaleY(1); opacity: 1; }
        .sprout-character[data-stage="4"] .sc-leaf-l1,
        .sprout-character[data-stage="4"] .sc-leaf-r1,
        .sprout-character[data-stage="4"] .sc-leaf-l2,
        .sprout-character[data-stage="4"] .sc-leaf-r2,
        .sprout-character[data-stage="4"] .sc-leaf-top { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="4"] .sc-bud-g { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="4"] .sc-bud-face { opacity: 1; }
        .sprout-character[data-stage="4"] .sc-head-face { opacity: 0; transform: scale(0.2); }

        .sprout-character[data-stage="5"] .sc-stem-g { transform: scaleY(1); opacity: 1; }
        .sprout-character[data-stage="5"] .sc-leaf-l1,
        .sprout-character[data-stage="5"] .sc-leaf-r1,
        .sprout-character[data-stage="5"] .sc-leaf-l2,
        .sprout-character[data-stage="5"] .sc-leaf-r2,
        .sprout-character[data-stage="5"] .sc-leaf-top { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="5"] .sc-bud-g { opacity: 0; transform: scale(0.2); }
        .sprout-character[data-stage="5"] .sc-flower-g { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="5"] .sc-fruit-g { opacity: 1; transform: scale(1); }
        .sprout-character[data-stage="5"] .sc-flower-face { opacity: 1; }
        .sprout-character[data-stage="5"] .sc-head-face { opacity: 0; transform: scale(0.2); }

        /* mouths / brows / tears — default */
        .sc-mouth-sad, .sc-mouth-angry, .sc-brows, .sc-tears { display: none; }
        .sprout-tone-wilt .sc-mouth-happy { display: none; }
        .sprout-tone-wilt .sc-mouth-sad { display: block; }

        /* cry mood */
        .sprout-mood-cry .sc-mouth-happy { display: none; }
        .sprout-mood-cry .sc-mouth-angry { display: none; }
        .sprout-mood-cry .sc-mouth-sad { display: block; }
        .sprout-mood-cry .sc-brows { display: none; }
        .sprout-mood-cry .sc-tears { display: block; }

        /* angry mood */
        .sprout-mood-angry .sc-mouth-happy { display: none; }
        .sprout-mood-angry .sc-mouth-sad { display: none; }
        .sprout-mood-angry .sc-mouth-angry { display: block; }
        .sprout-mood-angry .sc-brows { display: block; }
        .sprout-mood-angry .sc-tears { display: none; }

        /* love mood keeps smile */
        .sprout-mood-love .sc-mouth-sad { display: none; }
        .sprout-mood-love .sc-mouth-angry { display: none; }
        .sprout-mood-love .sc-mouth-happy { display: block; }
        .sprout-mood-love .sc-brows { display: none; }
        .sprout-mood-love .sc-tears { display: none; }

        @keyframes sprout-tear-fall {
          0% { opacity: 0; transform: translateY(0); }
          15% { opacity: 0.95; }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .sc-tear {
          transform-box: fill-box;
          transform-origin: center top;
          animation: sprout-tear-fall 0.9s ease-in infinite;
        }
        .sc-tear-delay { animation-delay: 0.35s; }

        @keyframes sprout-heart-float {
          0% {
            opacity: 0;
            transform: translate(-50%, 6px) scale(0.45);
          }
          /* 처음부터 위로 움직이게 — 페이드인만 하면 정지처럼 보임 */
          10% {
            opacity: 1;
            transform: translate(calc(-50% + var(--hx, 0px) * 0.2), -2px) scale(0.78);
          }
          55% {
            opacity: 1;
            transform: translate(calc(-50% + var(--hx, 0px) * 0.7), -28px) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--hx, 0px)), -48px) scale(1.12);
          }
        }
        .sc-hearts-overlay {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 3;
          overflow: visible;
        }
        .sc-hearts-overlay span {
          position: absolute;
          left: 50%;
          bottom: 55%;
          font-size: 0.85rem;
          line-height: 1;
          color: #e8899a;
          opacity: 0;
          filter: drop-shadow(0 1px 2px rgba(180, 80, 100, 0.25));
          animation: sprout-heart-float 1.15s cubic-bezier(0.2, 0.75, 0.25, 1) both;
          will-change: transform, opacity;
        }
        .sprout-character[data-stage="0"] .sc-hearts-overlay span { bottom: 40%; }
        .sc-hearts-overlay .h1 { --hx: -18px; animation-delay: 0s; }
        .sc-hearts-overlay .h2 { --hx: 14px; animation-delay: 0.1s; font-size: 0.7rem; color: #f2a3b0; }
        .sc-hearts-overlay .h3 { --hx: 2px; animation-delay: 0.2s; font-size: 1rem; color: #de6d84; }
        .sc-hearts-overlay .h4 { --hx: -12px; animation-delay: 0.32s; font-size: 0.65rem; }
        .sc-hearts-overlay .h5 { --hx: 18px; animation-delay: 0.42s; font-size: 0.75rem; color: #f0b4be; }

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
          0% { transform: scale(1); filter: brightness(1); }
          35% { transform: scale(1.22); filter: brightness(1.22); }
          65% { transform: scale(0.96); filter: brightness(1.08); }
          100% { transform: scale(1); filter: brightness(1); }
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
        .sprout-fx-bloom { animation: sprout-bloom 1.1s ease-out; }
        .sprout-fx-wilt { animation: sprout-wilt 0.6s ease-in forwards; }
        .sprout-growing { animation: sprout-grow-pop 1.1s cubic-bezier(0.34, 1.4, 0.64, 1); }
        .sprout-growing .sc-sparkle { animation: sprout-sparkle 1.1s ease-out both; }
        .sc-blink { transform-origin: center; animation: sprout-blink 4.5s ease-in-out infinite; }
        .sprout-mood-angry .sc-blink { animation: none; }

        /* pot skin overrides */
        .sprout-character[data-pot-skin] .sc-pot ellipse,
        .sprout-character[data-pot-skin] .sc-pot path,
        .sprout-character[data-pot-skin] .sc-pot rect {
          transition: fill 0.4s ease;
        }
        .sprout-character[data-pot-skin] .sc-pot > ellipse:first-child { fill: var(--pot-shadow); }
        .sprout-character[data-pot-skin] .sc-pot > path:nth-of-type(1) { fill: var(--pot-body); }
        .sprout-character[data-pot-skin] .sc-pot > rect { fill: var(--pot-rim); }
        .sprout-character[data-pot-skin] .sc-pot > ellipse:nth-of-type(2) { fill: var(--pot-rim-dark); }
        .sprout-character[data-pot-skin] .sc-pot > ellipse:nth-of-type(3) { fill: var(--pot-soil); opacity: 0.55; }
        .sprout-character[data-pot-skin] .sc-pot > ellipse:nth-of-type(4) { fill: var(--pot-soil); opacity: 0.35; }
        .sprout-character[data-pot-skin="glass"] .sc-pot > path:nth-of-type(1) { opacity: 0.82; }
        .sprout-character[data-pot-skin="vintage-tin"] .sc-pot > rect { fill: var(--pot-accent); opacity: 0.35; }
      `}</style>

      {mood === "love" && (
        <div className="sc-hearts-overlay" key={`hearts-${moodPulse}`}>
          <span className="h1">♥</span>
          <span className="h2">♥</span>
          <span className="h3">♥</span>
          <span className="h4">♥</span>
          <span className="h5">♥</span>
        </div>
      )}

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
          <path className="sc-brows" d="M36 48l7 3.2" stroke="#5a4638" strokeWidth="1.7" strokeLinecap="round" />
          <path className="sc-brows" d="M64 48l-7 3.2" stroke="#5a4638" strokeWidth="1.7" strokeLinecap="round" />
          <ellipse className="sc-blink" cx="41.5" cy="54" rx="2.6" ry="3.1" fill="#5a4638" />
          <ellipse className="sc-blink" cx="58.5" cy="54" rx="2.6" ry="3.1" fill="#5a4638" />
          <path
            className="sc-mouth-happy"
            d="M44.5 62c2.2 2.8 8.8 2.8 11 0"
            stroke="#5a4638"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            className="sc-mouth-sad"
            d="M45.5 64c2-2.2 7-2.2 9 0"
            stroke="#5a4638"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            className="sc-mouth-angry"
            d="M45 63.5c1.2 0 2-.8 2.8-.8s1.6.8 2.7.8 1.8-.8 2.7-.8 1.7.8 2.8.8"
            stroke="#5a4638"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g className="sc-tears">
            <ellipse className="sc-tear" cx="37.5" cy="60" rx="1.7" ry="2.4" fill="#7eb8d4" />
            <ellipse className="sc-tear sc-tear-delay" cx="62.5" cy="60" rx="1.7" ry="2.4" fill="#7eb8d4" />
          </g>
          <circle cx="35" cy="58" r="2.6" fill="#e8a598" opacity="0.85" />
          <circle cx="65" cy="58" r="2.6" fill="#e8a598" opacity="0.85" />
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

          {/* Lv1~3: 줄기 위 머리 + 얼굴 */}
          <g className="sc-crown-g sc-head-face">
            <ellipse cx="50" cy="30" rx="10" ry="9.5" fill="#c5d6b0" />
            <ellipse cx="50" cy="29" rx="8" ry="7" fill="#d4e4c4" opacity="0.55" />
            <path className="sc-brows" d="M41.5 25.5l5 2.2" stroke="#5a4638" strokeWidth="1.25" strokeLinecap="round" />
            <path className="sc-brows" d="M58.5 25.5l-5 2.2" stroke="#5a4638" strokeWidth="1.25" strokeLinecap="round" />
            <ellipse className="sc-blink" cx="45.5" cy="29.5" rx="1.7" ry="2.1" fill="#5a4638" />
            <ellipse className="sc-blink" cx="54.5" cy="29.5" rx="1.7" ry="2.1" fill="#5a4638" />
            <path
              className="sc-mouth-happy"
              d="M46.5 34c1.5 2 5.5 2 7 0"
              stroke="#5a4638"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              className="sc-mouth-sad"
              d="M47.2 35.5c1.3-1.6 4.3-1.6 5.6 0"
              stroke="#5a4638"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
            <path
              className="sc-mouth-angry"
              d="M47 34.8c.8 0 1.3-.55 1.9-.55s1.1.55 1.8.55 1.2-.55 1.8-.55 1.15.55 1.9.55"
              stroke="#5a4638"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g className="sc-tears">
              <ellipse className="sc-tear" cx="42.2" cy="33.5" rx="1.15" ry="1.7" fill="#7eb8d4" />
              <ellipse className="sc-tear sc-tear-delay" cx="57.8" cy="33.5" rx="1.15" ry="1.7" fill="#7eb8d4" />
            </g>
            <circle cx="41.5" cy="32.5" r="1.8" fill="#e8a598" opacity="0.85" />
            <circle cx="58.5" cy="32.5" r="1.8" fill="#e8a598" opacity="0.85" />
          </g>

          <g className="sc-crown-g sc-bud-g">
            <ellipse cx="50" cy="26" rx="8.5" ry="10.5" fill="#e8a598" />
            <ellipse cx="50" cy="23.5" rx="5" ry="6" fill="#f0b8ac" opacity="0.85" />
            <path d="M50 16.5v5" stroke="#7a9168" strokeWidth="1.6" strokeLinecap="round" />
            <g className="sc-bud-face">
              <path className="sc-brows" d="M42.5 22.8l4.2 1.8" stroke="#5a4638" strokeWidth="1.15" strokeLinecap="round" />
              <path className="sc-brows" d="M57.5 22.8l-4.2 1.8" stroke="#5a4638" strokeWidth="1.15" strokeLinecap="round" />
              <ellipse className="sc-blink" cx="46.2" cy="26.5" rx="1.55" ry="1.9" fill="#5a4638" />
              <ellipse className="sc-blink" cx="53.8" cy="26.5" rx="1.55" ry="1.9" fill="#5a4638" />
              <path
                className="sc-mouth-happy"
                d="M47 30.5c1.3 1.7 4.7 1.7 6 0"
                stroke="#5a4638"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <path
                className="sc-mouth-sad"
                d="M47.5 31.5c1.2-1.4 4-1.4 5 0"
                stroke="#5a4638"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <path
                className="sc-mouth-angry"
                d="M47.2 30.6c.7 0 1.15-.5 1.7-.5s1 .5 1.65.5 1.05-.5 1.65-.5 1 .5 1.7.5"
                stroke="#5a4638"
                strokeWidth="1.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g className="sc-tears">
                <ellipse className="sc-tear" cx="43.2" cy="30.2" rx="1.05" ry="1.55" fill="#7eb8d4" />
                <ellipse className="sc-tear sc-tear-delay" cx="56.8" cy="30.2" rx="1.05" ry="1.55" fill="#7eb8d4" />
              </g>
              <circle cx="42.5" cy="29" r="1.6" fill="#d4847c" opacity="0.7" />
              <circle cx="57.5" cy="29" r="1.6" fill="#d4847c" opacity="0.7" />
            </g>
          </g>

          <g className="sc-crown-g sc-flower-g">
            <circle cx="50" cy="21" r="5.8" fill="#f3c4b8" />
            <circle cx="42.5" cy="26" r="5.2" fill="#e8a598" />
            <circle cx="57.5" cy="26" r="5.2" fill="#e8a598" />
            <circle cx="44.5" cy="17.5" r="4.8" fill="#f0b8ac" />
            <circle cx="55.5" cy="17.5" r="4.8" fill="#f0b8ac" />
            <circle cx="50" cy="23" r="4.2" fill="#f5e6a8" />
            <g className="sc-flower-face">
              <path className="sc-brows" d="M44 19.8l3.2 1.4" stroke="#5a4638" strokeWidth="1.05" strokeLinecap="round" />
              <path className="sc-brows" d="M56 19.8l-3.2 1.4" stroke="#5a4638" strokeWidth="1.05" strokeLinecap="round" />
              <ellipse className="sc-blink" cx="47" cy="22.5" rx="1.35" ry="1.65" fill="#5a4638" />
              <ellipse className="sc-blink" cx="53" cy="22.5" rx="1.35" ry="1.65" fill="#5a4638" />
              <path
                className="sc-mouth-happy"
                d="M47.5 25.8c1.1 1.4 3.9 1.4 5 0"
                stroke="#5a4638"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              <path
                className="sc-mouth-sad"
                d="M48 26.8c1-1.2 3.2-1.2 4 0"
                stroke="#5a4638"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              <path
                className="sc-mouth-angry"
                d="M47.8 25.9c.55 0 .9-.4 1.35-.4s.8.4 1.3.4.85-.4 1.3-.4.85.4 1.35.4"
                stroke="#5a4638"
                strokeWidth="1.05"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g className="sc-tears">
                <ellipse className="sc-tear" cx="44.5" cy="25.5" rx="0.9" ry="1.3" fill="#7eb8d4" />
                <ellipse className="sc-tear sc-tear-delay" cx="55.5" cy="25.5" rx="0.9" ry="1.3" fill="#7eb8d4" />
              </g>
              <circle cx="44" cy="25" r="1.3" fill="#e8a598" opacity="0.8" />
              <circle cx="56" cy="25" r="1.3" fill="#e8a598" opacity="0.8" />
            </g>
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
