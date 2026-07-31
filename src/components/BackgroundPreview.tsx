"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { BackgroundDef } from "@/lib/backgrounds";

type BackgroundPreviewProps = {
  background: BackgroundDef;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = {
  sm: "h-14 w-20",
  md: "h-20 w-28",
  lg: "h-24 w-full",
};

type Particle = {
  left: string;
  top?: string;
  size: number;
  duration: number;
  delay: number;
  drift?: number;
  opacity?: number;
  blur?: number;
};

const NIGHT_STARS_FULL: Particle[] = [
  { left: "6%", top: "11%", size: 2, duration: 2.8, delay: 0 },
  { left: "13%", top: "31%", size: 1.5, duration: 3.4, delay: 0.6 },
  { left: "21%", top: "8%", size: 2.5, duration: 2.2, delay: 1.1 },
  { left: "29%", top: "24%", size: 1.5, duration: 3.8, delay: 0.3 },
  { left: "37%", top: "15%", size: 2, duration: 2.6, delay: 1.5 },
  { left: "44%", top: "36%", size: 1.5, duration: 3.1, delay: 0.9 },
  { left: "51%", top: "9%", size: 2.5, duration: 2.4, delay: 0.2 },
  { left: "59%", top: "27%", size: 1.5, duration: 3.6, delay: 1.8 },
  { left: "67%", top: "14%", size: 2, duration: 2.9, delay: 0.7 },
  { left: "74%", top: "33%", size: 1.5, duration: 3.3, delay: 1.3 },
  { left: "81%", top: "19%", size: 2.5, duration: 2.7, delay: 0.4 },
  { left: "89%", top: "7%", size: 2, duration: 3.5, delay: 1.0 },
  { left: "94%", top: "29%", size: 1.5, duration: 3.0, delay: 2.1 },
  { left: "17%", top: "42%", size: 1.5, duration: 3.2, delay: 1.6 },
  { left: "63%", top: "41%", size: 1.5, duration: 2.5, delay: 0.8 },
];

const NIGHT_STARS_PREVIEW = NIGHT_STARS_FULL.slice(0, 7);

/** Irregular x / speed / delay — avoid even grid columns */
const RAIN_FULL: Particle[] = [
  { left: "4%", size: 17, duration: 0.78, delay: 0.05, drift: -14 },
  { left: "11%", size: 23, duration: 1.12, delay: 0.41, drift: -8 },
  { left: "15%", size: 14, duration: 0.91, delay: 0.88, drift: -18 },
  { left: "22%", size: 26, duration: 0.69, delay: 0.17, drift: -11 },
  { left: "27%", size: 19, duration: 1.04, delay: 0.63, drift: -6 },
  { left: "33%", size: 15, duration: 0.84, delay: 1.21, drift: -16 },
  { left: "39%", size: 24, duration: 0.73, delay: 0.34, drift: -9 },
  { left: "46%", size: 18, duration: 1.18, delay: 0.97, drift: -13 },
  { left: "51%", size: 21, duration: 0.86, delay: 0.12, drift: -7 },
  { left: "58%", size: 13, duration: 0.99, delay: 0.55, drift: -19 },
  { left: "63%", size: 27, duration: 0.71, delay: 1.08, drift: -10 },
  { left: "69%", size: 16, duration: 1.09, delay: 0.28, drift: -15 },
  { left: "74%", size: 22, duration: 0.81, delay: 0.74, drift: -5 },
  { left: "81%", size: 18, duration: 0.95, delay: 0.49, drift: -12 },
  { left: "86%", size: 25, duration: 0.67, delay: 1.33, drift: -17 },
  { left: "91%", size: 14, duration: 1.15, delay: 0.21, drift: -8 },
  { left: "96%", size: 20, duration: 0.88, delay: 0.81, drift: -14 },
  { left: "8%", size: 12, duration: 1.22, delay: 1.45, drift: -20 },
  { left: "42%", size: 28, duration: 0.64, delay: 1.62, drift: -11 },
  { left: "77%", size: 15, duration: 1.01, delay: 1.71, drift: -9 },
];

const RAIN_PREVIEW = [
  RAIN_FULL[0]!,
  RAIN_FULL[3]!,
  RAIN_FULL[6]!,
  RAIN_FULL[9]!,
  RAIN_FULL[12]!,
  RAIN_FULL[15]!,
  RAIN_FULL[18]!,
];

/** Near petals are larger/faster; far petals softer */
const PETALS_FULL: Particle[] = [
  { left: "6%", size: 7, duration: 9.5, delay: 0, drift: 36, opacity: 0.55, blur: 0.5 },
  { left: "14%", size: 11, duration: 7.2, delay: 1.2, drift: -22 },
  { left: "22%", size: 6, duration: 10.2, delay: 0.4, drift: 48, opacity: 0.45, blur: 1 },
  { left: "30%", size: 13, duration: 6.4, delay: 2.1, drift: -30 },
  { left: "38%", size: 9, duration: 8.0, delay: 0.8, drift: 24 },
  { left: "46%", size: 5, duration: 11.0, delay: 1.6, drift: -40, opacity: 0.4, blur: 1 },
  { left: "54%", size: 14, duration: 6.0, delay: 0.2, drift: 52 },
  { left: "62%", size: 8, duration: 8.6, delay: 2.4, drift: -18 },
  { left: "70%", size: 12, duration: 7.0, delay: 1.0, drift: 28 },
  { left: "78%", size: 6, duration: 10.4, delay: 1.8, drift: -34, opacity: 0.5, blur: 0.5 },
  { left: "86%", size: 11, duration: 7.4, delay: 0.6, drift: 42 },
  { left: "92%", size: 9, duration: 8.2, delay: 2.8, drift: -26 },
  { left: "18%", size: 15, duration: 5.8, delay: 3.2, drift: 20 },
  { left: "66%", size: 7, duration: 9.8, delay: 3.6, drift: -44, opacity: 0.5 },
];

const PETALS_PREVIEW = PETALS_FULL.slice(0, 7);

const SNOW_FULL: Particle[] = [
  { left: "5%", size: 2, duration: 10.5, delay: 0, drift: 16, opacity: 0.5, blur: 0.5 },
  { left: "12%", size: 3.5, duration: 8.2, delay: 1.1, drift: -12 },
  { left: "20%", size: 2, duration: 11.0, delay: 0.5, drift: 22, opacity: 0.45, blur: 1 },
  { left: "28%", size: 4.5, duration: 7.4, delay: 2.0, drift: -18 },
  { left: "36%", size: 2.5, duration: 9.6, delay: 0.9, drift: 14 },
  { left: "44%", size: 5, duration: 6.8, delay: 1.7, drift: -24 },
  { left: "52%", size: 2, duration: 10.8, delay: 0.3, drift: 28, opacity: 0.4, blur: 1 },
  { left: "60%", size: 3.5, duration: 8.0, delay: 2.3, drift: -10 },
  { left: "68%", size: 4, duration: 7.6, delay: 1.3, drift: 18 },
  { left: "76%", size: 2.5, duration: 9.8, delay: 1.9, drift: -20 },
  { left: "84%", size: 5, duration: 6.6, delay: 0.7, drift: 24 },
  { left: "92%", size: 3, duration: 8.8, delay: 2.6, drift: -16 },
  { left: "16%", size: 2, duration: 11.4, delay: 3.1, drift: 12, opacity: 0.45 },
  { left: "72%", size: 4, duration: 7.8, delay: 3.5, drift: -22 },
];

const SNOW_PREVIEW = SNOW_FULL.slice(0, 7);

/**
 * 배경 미리보기 — PNG 또는 CSS 장면 클래스.
 */
export function BackgroundPreview({
  background,
  className = "",
  size = "md",
}: BackgroundPreviewProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-[#e8dcc8] ${SIZE_CLASS[size]} ${background.sceneClass ?? "bg-[#f0ebe3]"} ${className}`}
      aria-hidden
    >
      {background.src && (
        <Image
          src={background.src}
          alt=""
          fill
          sizes="120px"
          className={background.imageClass ?? "object-cover"}
        />
      )}
      {background.sceneClass && !background.src && (
        <BackgroundSceneOverlay sceneId={background.id} density="preview" />
      )}
    </div>
  );
}

/** CSS 장면 배경 위 깊이 레이어 + 애니메이션 — 홈·상점·보관함 공용 */
export function BackgroundSceneOverlay({
  sceneId,
  density = "full",
}: {
  sceneId: string;
  density?: "preview" | "full";
}) {
  const isFull = density === "full";
  const content = renderSceneContent(sceneId, isFull);
  if (!content) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {content}
    </div>
  );
}

function renderSceneContent(sceneId: string, isFull: boolean) {
  switch (sceneId) {
    case "night-sky":
      return (
        <>
          {/* far: nebulae */}
          <span
            className="bg-fx-haze absolute left-[8%] top-[18%] h-[42%] w-[55%] bg-[#5a6fa8]/35"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="bg-fx-haze absolute right-[5%] top-[26%] h-[30%] w-[40%] bg-[#7a5a98]/22"
            style={{ animationDelay: "2.2s", animationDuration: "11s" }}
          />
          {/* mid: moon + soft glow ring */}
          <span
            className="absolute rounded-full bg-[#fff4d4]/15 blur-xl"
            style={{
              right: isFull ? "10%" : "8%",
              top: isFull ? "6%" : "5%",
              width: isFull ? 72 : 36,
              height: isFull ? 72 : 36,
            }}
          />
          <span
            className="bg-fx-moon"
            style={{
              right: isFull ? "14%" : "12%",
              top: isFull ? "10%" : "8%",
              width: isFull ? 36 : 18,
              height: isFull ? 36 : 18,
            }}
          />
          {(isFull ? NIGHT_STARS_FULL : NIGHT_STARS_PREVIEW).map((star, i) => (
            <span
              key={`star-${i}`}
              className="bg-fx-star"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
          {/* near-sky: shooting stars — right → left, shared path tilt */}
          <span
            className="bg-fx-shooting-star"
            style={{
              top: isFull ? "16%" : "14%",
              width: isFull ? 64 : 40,
              animationDelay: "0.8s",
              animationDuration: "9s",
            }}
          />
          <span
            className="bg-fx-shooting-star"
            style={{
              top: isFull ? "28%" : "24%",
              width: isFull ? 48 : 32,
              animationDelay: "4.6s",
              animationDuration: "9s",
            }}
          />
          {isFull && (
            <span
              className="bg-fx-shooting-star"
              style={{
                top: "11%",
                width: 40,
                animationDelay: "7.2s",
                animationDuration: "9s",
              }}
            />
          )}
          {/* near: layered ridgeline */}
          <span className="bg-fx-hill absolute bottom-[-6%] left-[-10%] h-[24%] w-[48%] bg-[#1a2438]/55 blur-[1px]" />
          <span className="bg-fx-hill absolute bottom-[-8%] left-[-8%] h-[28%] w-[55%] bg-[#121a2c]/75" />
          <span className="bg-fx-hill absolute bottom-[-10%] right-[-6%] h-[34%] w-[62%] bg-[#0e1524]/85" />
          <span className="absolute bottom-[12%] left-[18%] h-2 w-2 rounded-full bg-[#f0d78c]/35 blur-[1px]" />
          <span className="absolute bottom-[15%] right-[22%] h-1.5 w-1.5 rounded-full bg-[#f0d78c]/25 blur-[1px]" />
          <span className="bg-fx-ground-glow absolute bottom-[10%] left-1/2 h-8 w-28 -translate-x-1/2 rounded-full bg-[#3d4f78]/35 blur-md" />
        </>
      );

    case "rainy-window":
      return (
        <>
          {/* far: outdoor landscape behind glass */}
          <span className="bg-fx-hill absolute bottom-[20%] left-[-8%] h-[26%] w-[52%] bg-[#6a8294]/40 blur-[2px]" />
          <span className="bg-fx-hill absolute bottom-[18%] right-[-6%] h-[30%] w-[56%] bg-[#5f7a8c]/35 blur-[2px]" />
          <span className="absolute bottom-[34%] left-[12%] h-[18%] w-[10%] rounded-t-full bg-[#4d6574]/30 blur-[1px]" />
          <span className="absolute bottom-[36%] left-[22%] h-[14%] w-[8%] rounded-t-full bg-[#4d6574]/25 blur-[1px]" />
          <span className="absolute bottom-[35%] right-[18%] h-[16%] w-[9%] rounded-t-full bg-[#4d6574]/28 blur-[1px]" />
          <span
            className="bg-fx-haze absolute left-[20%] top-[22%] h-[20%] w-[35%] bg-white/20"
            style={{ animationDuration: "8s" }}
          />

          {/* mid: irregular rain (no even columns) */}
          {(isFull ? RAIN_FULL : RAIN_PREVIEW).map((drop, i) => (
            <span
              key={`rain-${i}`}
              className="bg-fx-raindrop"
              style={
                {
                  left: drop.left,
                  height: drop.size,
                  width: drop.size > 22 ? 2 : 1.5,
                  "--bg-drift": `${drop.drift ?? -10}px`,
                  "--rain-opacity": drop.size > 22 ? 0.7 : 0.5,
                  animationDuration: `${drop.duration}s`,
                  animationDelay: `${drop.delay}s`,
                } as CSSProperties
              }
            />
          ))}

          {/* near: window chrome — soft frame, no hard cross-grid mullions */}
          <span className="bg-fx-window-frame" />
          <span className="bg-fx-glass-sheen" />
          <span className="absolute inset-y-[10%] left-[8%] w-[3%] rounded-sm bg-[#f5f0e8]/25" />
          <span className="absolute inset-y-[10%] right-[8%] w-[3%] rounded-sm bg-[#f5f0e8]/20" />
          <span className="absolute bottom-[6%] left-[8%] right-[8%] h-[8%] rounded-sm bg-[#e8e0d4]/45" />
          <span className="absolute bottom-[10%] left-[14%] h-3 w-5 rounded-sm bg-[#9caf88]/35" />
          <span className="absolute bottom-[10%] left-[22%] h-2.5 w-4 rounded-sm bg-[#e8a598]/30" />
          <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-[#f5f0e8]/50 to-transparent" />
        </>
      );

    case "cherry-garden":
      return <CherryGardenScene isFull={isFull} />;

    case "first-snow":
      return (
        <>
          <span
            className="bg-fx-haze absolute left-[15%] top-[12%] h-[24%] w-[70%] bg-white/45"
            style={{ animationDuration: "12s" }}
          />
          <span className="bg-fx-hill absolute bottom-[30%] left-[-6%] h-[18%] w-[45%] bg-[#9aafc0]/35 blur-[1.5px]" />
          <span className="bg-fx-hill absolute bottom-[28%] right-[-8%] h-[20%] w-[50%] bg-[#8aa0b4]/30 blur-[1.5px]" />
          <span className="bg-fx-hill absolute bottom-[26%] left-[28%] h-[14%] w-[38%] bg-[#a8bccc]/28 blur-[1px]" />
          {(isFull ? SNOW_FULL : SNOW_PREVIEW).map((flake, i) => (
            <span
              key={`snow-${i}`}
              className="bg-fx-snowflake"
              style={
                {
                  left: flake.left,
                  width: flake.size,
                  height: flake.size,
                  opacity: flake.opacity,
                  filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
                  "--bg-drift": `${flake.drift ?? 16}px`,
                  animationDuration: `${flake.duration}s`,
                  animationDelay: `${flake.delay}s`,
                } as CSSProperties
              }
            />
          ))}
          <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[34%] bg-gradient-to-t from-white/75 via-white/35 to-transparent" />
          <span className="bg-fx-ground-glow absolute bottom-[6%] left-1/2 h-5 w-36 -translate-x-1/2 rounded-full bg-white/50 blur-md" />
        </>
      );

    default:
      return null;
  }
}

/** 벚꽃 정원 — 나무·수풀·꽃·나비·새 등 장면 디테일 */
function CherryGardenScene({ isFull }: { isFull: boolean }) {
  return (
    <>
      {/* far: sky haze + distant treeline */}
      <span
        className="bg-fx-haze absolute left-[22%] top-[4%] h-[20%] w-[55%] bg-white/55"
        style={{ animationDuration: "10s" }}
      />
      <span className="bg-fx-hill absolute bottom-[38%] left-[-4%] h-[16%] w-[40%] bg-[#c9a0b0]/35 blur-[2px]" />
      <span className="bg-fx-hill absolute bottom-[36%] right-[-2%] h-[18%] w-[36%] bg-[#d4a8b8]/30 blur-[2px]" />
      <span className="bg-fx-hill absolute bottom-[34%] left-[30%] h-[12%] w-[34%] bg-[#b8c9a0]/28 blur-[1.5px]" />

      {/* mid-far: distant soft cherry blobs */}
      <span
        className="bg-fx-canopy absolute left-[28%] top-[22%] h-[18%] w-[22%] bg-[#e8a8bc]/35"
        style={{ animationDelay: "0.8s", animationDuration: "9.5s" }}
      />
      <span
        className="bg-fx-canopy absolute right-[24%] top-[20%] h-[16%] w-[20%] bg-[#f0b4c8]/30"
        style={{ animationDelay: "1.6s", animationDuration: "8.2s" }}
      />

      {/* mid: cherry trees */}
      <CherryTree
        className="bg-fx-tree bg-fx-tree-sway absolute bottom-[16%] left-[-2%]"
        style={{
          width: isFull ? "42%" : "46%",
          height: isFull ? "72%" : "68%",
          animationDelay: "0s",
        }}
        mirror={false}
      />
      <CherryTree
        className="bg-fx-tree bg-fx-tree-sway absolute bottom-[14%] right-[-4%]"
        style={{
          width: isFull ? "40%" : "44%",
          height: isFull ? "76%" : "70%",
          animationDelay: "1.3s",
          animationDuration: "9s",
        }}
        mirror
      />
      {isFull && (
        <CherryTree
          className="bg-fx-tree bg-fx-tree-sway absolute bottom-[22%] left-[34%]"
          style={{
            width: "22%",
            height: "42%",
            opacity: 0.72,
            animationDelay: "0.6s",
            animationDuration: "10s",
            filter: "blur(0.4px)",
          }}
          mirror={false}
          compact
        />
      )}

      {/* mid: falling petals */}
      {(isFull ? PETALS_FULL : PETALS_PREVIEW).map((petal, i) => (
        <span
          key={`petal-${i}`}
          className="bg-fx-petal"
          style={
            {
              left: petal.left,
              width: petal.size,
              height: petal.size * 0.75,
              opacity: petal.opacity,
              filter: petal.blur ? `blur(${petal.blur}px)` : undefined,
              "--bg-drift": `${petal.drift ?? 28}px`,
              animationDuration: `${petal.duration}s`,
              animationDelay: `${petal.delay}s`,
              zIndex: 1,
            } as CSSProperties
          }
        />
      ))}

      {/* near: ground plane + path */}
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-t from-[#8fad7a]/55 via-[#b7cfa4]/30 to-transparent" />
      <span className="absolute bottom-[10%] left-1/2 h-[10%] w-[38%] -translate-x-1/2 rounded-[100%] bg-[#c4b496]/35 blur-[1px]" />
      <span className="absolute bottom-[8%] left-1/2 h-[6%] w-[28%] -translate-x-1/2 rounded-[100%] bg-[#d4c4a8]/40" />

      {/* near: bushes & flowers */}
      <GardenBush
        className="absolute bottom-[8%] left-[6%]"
        style={{ width: isFull ? 58 : 36, height: isFull ? 36 : 22 }}
      />
      <GardenBush
        className="absolute bottom-[7%] right-[8%]"
        style={{ width: isFull ? 52 : 32, height: isFull ? 32 : 20 }}
        tone="rose"
      />
      {isFull && (
        <GardenBush
          className="absolute bottom-[11%] left-[22%]"
          style={{ width: 40, height: 24, opacity: 0.85 }}
          tone="sage"
        />
      )}

      {(isFull
        ? [
            { left: "12%", delay: "0s", color: "#f2a0b8" },
            { left: "18%", delay: "0.6s", color: "#fff0f5" },
            { left: "72%", delay: "1.1s", color: "#e888a8" },
            { left: "78%", delay: "0.3s", color: "#f8c0d0" },
            { left: "30%", delay: "1.4s", color: "#ffe08a" },
            { left: "84%", delay: "0.9s", color: "#fff0f5" },
          ]
        : [
            { left: "14%", delay: "0s", color: "#f2a0b8" },
            { left: "76%", delay: "0.5s", color: "#e888a8" },
            { left: "28%", delay: "1s", color: "#ffe08a" },
          ]
      ).map((bloom, i) => (
        <span
          key={`bloom-${i}`}
          className="bg-fx-bloom"
          style={{
            left: bloom.left,
            bottom: isFull ? "11%" : "10%",
            width: isFull ? 7 : 5,
            height: isFull ? 7 : 5,
            background: `radial-gradient(circle at 35% 35%, #fff, ${bloom.color})`,
            animationDelay: bloom.delay,
          }}
        />
      ))}

      {/* near: grass blades */}
      {(isFull
        ? [8, 14, 20, 68, 74, 82, 88]
        : [10, 18, 72, 84]
      ).map((left, i) => (
        <span
          key={`grass-${i}`}
          className="bg-fx-grass-blade"
          style={{
            left: `${left}%`,
            height: isFull ? 14 + (i % 3) * 4 : 10 + (i % 2) * 3,
            background:
              i % 2 === 0
                ? "linear-gradient(180deg, #9caf88, #6d8a5e)"
                : "linear-gradient(180deg, #b7cfa4, #7a9168)",
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${3 + (i % 3) * 0.4}s`,
          }}
        />
      ))}

      {/* creatures */}
      <span
        className="bg-fx-butterfly"
        style={{
          left: isFull ? "42%" : "40%",
          top: isFull ? "38%" : "36%",
          animationDelay: "0.2s",
        }}
      >
        <ButterflySvg />
      </span>
      {isFull && (
        <span
          className="bg-fx-butterfly"
          style={{
            left: "58%",
            top: "48%",
            width: 11,
            height: 10,
            animationDelay: "1.8s",
            animationDuration: "5.4s",
          }}
        >
          <ButterflySvg tone="lilac" />
        </span>
      )}
      <span
        className="bg-fx-bird"
        style={{
          left: "92%",
          top: isFull ? "18%" : "16%",
          animationDelay: "2s",
        }}
      >
        <BirdSvg />
      </span>

      {/* soft ground glow */}
      <span className="bg-fx-ground-glow absolute bottom-[6%] left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-[#6d8a5e]/22 blur-md" />
    </>
  );
}

function CherryTree({
  className = "",
  style,
  mirror = false,
  compact = false,
}: {
  className?: string;
  style?: CSSProperties;
  mirror?: boolean;
  compact?: boolean;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 120 160"
      fill="none"
      aria-hidden
    >
      <g transform={mirror ? "translate(120,0) scale(-1,1)" : undefined}>
        {/* trunk */}
        <path
          d={
            compact
              ? "M58 158 C56 120 54 95 52 78 C60 90 68 110 66 158 Z"
              : "M56 158 C52 118 48 88 44 62 C58 78 72 108 70 158 Z"
          }
          fill="#8b6b4a"
        />
        <path
          d={
            compact
              ? "M58 158 C57 125 55 100 54 82"
              : "M58 158 C55 120 52 92 50 68"
          }
          stroke="#6e5338"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        {/* canopy clusters */}
        <ellipse cx="38" cy="58" rx="28" ry="24" fill="#f0b8c8" opacity="0.92" />
        <ellipse cx="68" cy="48" rx="30" ry="26" fill="#e898b0" opacity="0.9" />
        <ellipse cx="52" cy="36" rx="24" ry="20" fill="#f7cdd8" opacity="0.95" />
        <ellipse cx="78" cy="62" rx="18" ry="16" fill="#e888a8" opacity="0.85" />
        <ellipse cx="28" cy="70" rx="16" ry="14" fill="#f5c0d0" opacity="0.8" />
        {!compact && (
          <>
            <ellipse cx="60" cy="28" rx="14" ry="12" fill="#fff0f5" opacity="0.75" />
            <circle cx="34" cy="50" r="3.2" fill="#fff5f8" opacity="0.9" />
            <circle cx="58" cy="40" r="2.6" fill="#fff5f8" opacity="0.85" />
            <circle cx="74" cy="54" r="2.8" fill="#fff5f8" opacity="0.8" />
            <circle cx="46" cy="64" r="2.2" fill="#fff5f8" opacity="0.75" />
          </>
        )}
      </g>
    </svg>
  );
}

function GardenBush({
  className = "",
  style,
  tone = "pink",
}: {
  className?: string;
  style?: CSSProperties;
  tone?: "pink" | "rose" | "sage";
}) {
  const fills =
    tone === "sage"
      ? ["#9caf88", "#7a9168", "#b7cfa4"]
      : tone === "rose"
        ? ["#e888a8", "#d07090", "#f0b0c4"]
        : ["#f0b8c8", "#e898b0", "#f7cdd8"];

  return (
    <svg className={className} style={style} viewBox="0 0 64 40" fill="none" aria-hidden>
      <ellipse cx="20" cy="26" rx="16" ry="12" fill={fills[0]} />
      <ellipse cx="40" cy="24" rx="18" ry="14" fill={fills[1]} />
      <ellipse cx="32" cy="18" rx="14" ry="11" fill={fills[2]} />
      <circle cx="24" cy="20" r="2" fill="#fff5f8" opacity="0.85" />
      <circle cx="38" cy="16" r="1.8" fill="#fff5f8" opacity="0.8" />
      <circle cx="44" cy="24" r="1.5" fill="#fff5f8" opacity="0.7" />
    </svg>
  );
}

function ButterflySvg({ tone = "coral" }: { tone?: "coral" | "lilac" }) {
  const wing = tone === "lilac" ? "#c4b0e0" : "#f0a090";
  const wingDark = tone === "lilac" ? "#9a82c4" : "#e88878";
  return (
    <svg viewBox="0 0 24 20" className="h-full w-full" fill="none" aria-hidden>
      <ellipse cx="7" cy="8" rx="6" ry="4.5" fill={wing} opacity="0.9" />
      <ellipse cx="17" cy="8" rx="6" ry="4.5" fill={wingDark} opacity="0.9" />
      <ellipse cx="7" cy="13" rx="4" ry="3" fill={wingDark} opacity="0.75" />
      <ellipse cx="17" cy="13" rx="4" ry="3" fill={wing} opacity="0.75" />
      <rect x="11" y="5" width="2" height="10" rx="1" fill="#5a5248" />
      <path d="M12 5 C10 2 8 1.5 7 2" stroke="#5a5248" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 5 C14 2 16 1.5 17 2" stroke="#5a5248" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function BirdSvg() {
  return (
    <svg viewBox="0 0 28 14" className="h-full w-full" fill="none" aria-hidden>
      <path
        d="M2 8 C8 2 14 2 20 6 C22 4 25 4 27 5 C24 7 22 8 20 9 C14 12 8 11 2 8 Z"
        fill="#6d655c"
        opacity="0.75"
      />
      <path
        d="M10 7 C13 5 16 5 18 7"
        stroke="#4a5248"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
