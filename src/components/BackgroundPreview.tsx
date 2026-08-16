"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { BackgroundDef } from "@/lib/backgrounds";

type BackgroundPreviewProps = {
  background: BackgroundDef;
  className?: string;
  size?: "sm" | "md" | "lg" | "tile";
};

const SIZE_CLASS = {
  sm: "h-14 w-20",
  md: "h-20 w-28",
  lg: "h-24 w-full",
  tile: "h-14 w-14 sm:h-16 sm:w-16",
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

const FIREFLIES_FULL: Particle[] = [
  { left: "14%", top: "52%", size: 3, duration: 2.6, delay: 0 },
  { left: "28%", top: "44%", size: 2, duration: 3.4, delay: 0.8 },
  { left: "41%", top: "61%", size: 2.5, duration: 2.2, delay: 1.4 },
  { left: "58%", top: "48%", size: 3, duration: 3.1, delay: 0.3 },
  { left: "72%", top: "56%", size: 2, duration: 2.8, delay: 1.1 },
  { left: "83%", top: "42%", size: 2.5, duration: 3.6, delay: 1.9 },
  { left: "22%", top: "68%", size: 2, duration: 2.4, delay: 0.6 },
  { left: "64%", top: "70%", size: 3, duration: 3.2, delay: 1.6 },
  { left: "48%", top: "38%", size: 2, duration: 2.9, delay: 2.2 },
];

const FIREFLIES_PREVIEW = FIREFLIES_FULL.slice(0, 5);

const DUST_FULL: Particle[] = [
  { left: "16%", size: 2, duration: 11.2, delay: 0, drift: 10 },
  { left: "28%", size: 1.5, duration: 13.4, delay: 1.6, drift: -8 },
  { left: "44%", size: 2.5, duration: 10.1, delay: 0.7, drift: 14 },
  { left: "58%", size: 1.5, duration: 12.6, delay: 2.4, drift: -6 },
  { left: "71%", size: 2, duration: 9.8, delay: 1.1, drift: 12 },
  { left: "82%", size: 1.5, duration: 14.0, delay: 3.0, drift: -10 },
  { left: "36%", size: 2, duration: 11.8, delay: 2.0, drift: 8 },
];

const DUST_PREVIEW = DUST_FULL.slice(0, 4);

const LAVENDER_PETALS_FULL: Particle[] = [
  { left: "8%", size: 6, duration: 9.2, delay: 0, drift: 22 },
  { left: "22%", size: 8, duration: 7.6, delay: 1.1, drift: -16 },
  { left: "38%", size: 5, duration: 10.4, delay: 0.5, drift: 30, opacity: 0.5 },
  { left: "54%", size: 9, duration: 6.8, delay: 1.8, drift: -24 },
  { left: "70%", size: 6, duration: 8.4, delay: 0.9, drift: 18 },
  { left: "84%", size: 7, duration: 7.2, delay: 2.2, drift: -12 },
  { left: "46%", size: 5, duration: 9.8, delay: 2.8, drift: 26, opacity: 0.45 },
];

const LAVENDER_PETALS_PREVIEW = LAVENDER_PETALS_FULL.slice(0, 4);

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
          {/* near-sky: shooting stars — upper-right → lower-left diagonal */}
          <span
            className="bg-fx-shooting-star"
            style={{
              top: isFull ? "10%" : "8%",
              width: isFull ? 72 : 44,
              animationDelay: "1.2s",
              animationDuration: "16s",
            }}
          />
          <span
            className="bg-fx-shooting-star"
            style={{
              top: isFull ? "22%" : "18%",
              width: isFull ? 56 : 36,
              animationDelay: "7.5s",
              animationDuration: "17s",
            }}
          />
          {isFull && (
            <span
              className="bg-fx-shooting-star"
              style={{
                top: "6%",
                width: 48,
                animationDelay: "12.8s",
                animationDuration: "18s",
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

    case "sunset-sea":
      return <SunsetSeaScene isFull={isFull} />;

    case "misty-forest":
      return <MistyForestScene isFull={isFull} />;

    case "lavender-hill":
      return <LavenderHillScene isFull={isFull} />;

    case "candle-study":
      return <CandleStudyScene isFull={isFull} />;

    default:
      return null;
  }
}

/** 노을 바다 — 등대·배·부두·바위·갈매기 */
function SunsetSeaScene({ isFull }: { isFull: boolean }) {
  return (
    <>
      <span
        className="bg-fx-haze absolute left-[8%] top-[8%] h-[22%] w-[38%] bg-[#ffd8b0]/45"
        style={{ animationDuration: "11s" }}
      />
      <span
        className="bg-fx-haze absolute right-[6%] top-[14%] h-[18%] w-[32%] bg-[#ffb090]/30"
        style={{ animationDelay: "1.6s", animationDuration: "13s" }}
      />
      <span
        className="bg-fx-sun"
        style={{
          left: "50%",
          top: isFull ? "26%" : "24%",
          width: isFull ? 44 : 24,
          height: isFull ? 44 : 24,
          marginLeft: isFull ? -22 : -12,
        }}
      />

      {/* far: island + lighthouse */}
      <span className="bg-fx-hill absolute bottom-[40%] left-[4%] h-[14%] w-[32%] bg-[#5a4060]/42 blur-[1px]" />
      <span className="bg-fx-hill absolute bottom-[38%] left-[16%] h-[10%] w-[18%] bg-[#4a3050]/48" />
      <LighthouseSvg
        className="absolute"
        style={{
          left: isFull ? "12%" : "10%",
          bottom: isFull ? "44%" : "42%",
          width: isFull ? 22 : 14,
          height: isFull ? 42 : 26,
        }}
      />
      <span className="bg-fx-hill absolute bottom-[36%] right-[8%] h-[12%] w-[26%] bg-[#4a3858]/40 blur-[0.8px]" />

      {/* mid: waves */}
      <span
        className="bg-fx-wave absolute bottom-[18%] left-[-18%] h-[22%] w-[80%] bg-[#3a4a68]/45"
        style={{ animationDuration: "7s" }}
      />
      <span
        className="bg-fx-wave absolute bottom-[10%] left-[-8%] h-[20%] w-[78%] bg-[#2c3c58]/55"
        style={{ animationDelay: "1.2s", animationDuration: "8.4s" }}
      />
      <span
        className="bg-fx-wave absolute bottom-[-4%] right-[-14%] h-[24%] w-[86%] bg-[#1e2c44]/70"
        style={{ animationDelay: "0.5s", animationDuration: "6.6s" }}
      />

      <SailboatSvg
        className="bg-fx-haze absolute"
        style={{
          left: isFull ? "58%" : "56%",
          bottom: isFull ? "28%" : "26%",
          width: isFull ? 48 : 32,
          height: isFull ? 36 : 24,
          animationDuration: "14s",
        }}
      />

      {/* near: pier, rocks, foam */}
      <PierSvg
        className="absolute bottom-[6%] left-[-2%]"
        style={{ width: isFull ? "42%" : "44%", height: isFull ? 52 : 34 }}
      />
      <SeaRockSvg
        className="absolute bottom-[8%] right-[8%]"
        style={{ width: isFull ? 56 : 36, height: isFull ? 28 : 18 }}
      />
      {isFull && (
        <SeaRockSvg
          className="absolute bottom-[10%] right-[22%]"
          style={{ width: 32, height: 16, opacity: 0.85 }}
        />
      )}
      {(isFull
        ? [
            { left: "22%", delay: "0s" },
            { left: "38%", delay: "0.7s" },
            { left: "54%", delay: "1.3s" },
            { left: "68%", delay: "0.4s" },
            { left: "46%", delay: "1.8s" },
            { left: "76%", delay: "1.0s" },
          ]
        : [
            { left: "30%", delay: "0s" },
            { left: "58%", delay: "0.8s" },
          ]
      ).map((spark, i) => (
        <span
          key={`spark-${i}`}
          className="bg-fx-star"
          style={{
            left: spark.left,
            top: isFull ? "58%" : "56%",
            width: 2.5,
            height: 2.5,
            background: "#ffe8c0",
            animationDelay: spark.delay,
            animationDuration: "2.4s",
          }}
        />
      ))}
      <span
        className="bg-fx-bird"
        style={{
          left: "90%",
          top: isFull ? "18%" : "16%",
          animationDelay: "1.4s",
        }}
      >
        <BirdSvg />
      </span>
      {isFull && (
        <span
          className="bg-fx-bird"
          style={{
            left: "96%",
            top: "24%",
            width: 18,
            height: 9,
            animationDelay: "6s",
            animationDuration: "18s",
          }}
        >
          <BirdSvg />
        </span>
      )}
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-[#1a2438]/55 to-transparent" />
    </>
  );
}

/** 안개 숲 — 오두막·고사리·버섯·이끼 돌·반딧불 */
function MistyForestScene({ isFull }: { isFull: boolean }) {
  return (
    <>
      <span
        className="bg-fx-haze absolute left-[10%] top-[6%] h-[28%] w-[70%] bg-[#d8ece0]/40"
        style={{ animationDuration: "14s" }}
      />
      <span
        className="bg-fx-haze absolute left-[-4%] top-[38%] h-[26%] w-[50%] bg-white/25"
        style={{ animationDelay: "2s", animationDuration: "12s" }}
      />
      <span
        className="bg-fx-haze absolute right-[4%] top-[44%] h-[20%] w-[40%] bg-[#c8ddd0]/22"
        style={{ animationDelay: "3.4s", animationDuration: "16s" }}
      />

      <span className="bg-fx-hill absolute bottom-[22%] left-[-8%] h-[28%] w-[46%] bg-[#1c3028]/55 blur-[1px]" />
      <span className="bg-fx-hill absolute bottom-[18%] right-[-10%] h-[34%] w-[52%] bg-[#14221c]/70" />

      <ForestCabinSvg
        className="absolute"
        style={{
          left: isFull ? "40%" : "38%",
          bottom: isFull ? "28%" : "26%",
          width: isFull ? 48 : 32,
          height: isFull ? 36 : 24,
          opacity: 0.78,
          filter: "blur(0.25px)",
        }}
      />

      <ForestTree
        className="bg-fx-tree bg-fx-tree-sway absolute bottom-[8%] left-[2%]"
        style={{
          width: isFull ? "34%" : "38%",
          height: isFull ? "78%" : "74%",
          opacity: 0.72,
          animationDelay: "0s",
        }}
      />
      <ForestTree
        className="bg-fx-tree bg-fx-tree-sway absolute bottom-[6%] right-[0%]"
        style={{
          width: isFull ? "38%" : "42%",
          height: isFull ? "86%" : "80%",
          opacity: 0.85,
          animationDelay: "1.2s",
          animationDuration: "9s",
        }}
        dark
      />
      {isFull && (
        <ForestTree
          className="bg-fx-tree bg-fx-tree-sway absolute bottom-[16%] left-[32%]"
          style={{
            width: "24%",
            height: "52%",
            opacity: 0.5,
            animationDelay: "0.6s",
            animationDuration: "10s",
            filter: "blur(0.6px)",
          }}
        />
      )}

      <span className="absolute bottom-[10%] left-[28%] h-[8%] w-[16%] rounded-[100%] bg-[#1a2a20]/50 blur-[1px]" />
      <span className="absolute bottom-[9%] right-[24%] h-[7%] w-[14%] rounded-[100%] bg-[#142018]/45 blur-[1px]" />

      <FernSvg
        className="absolute bottom-[6%] left-[8%]"
        style={{ width: isFull ? 40 : 26, height: isFull ? 36 : 24 }}
      />
      <FernSvg
        className="absolute bottom-[5%] right-[10%]"
        style={{ width: isFull ? 36 : 24, height: isFull ? 32 : 22 }}
        flip
      />
      <MushroomSvg
        className="absolute bottom-[8%] left-[22%]"
        style={{ width: isFull ? 22 : 14, height: isFull ? 22 : 14 }}
      />
      {isFull && (
        <MushroomSvg
          className="absolute bottom-[9%] right-[28%]"
          style={{ width: 16, height: 16 }}
          tone="amber"
        />
      )}

      {(isFull ? FIREFLIES_FULL : FIREFLIES_PREVIEW).map((bug, i) => (
        <span
          key={`fly-${i}`}
          className="bg-fx-firefly"
          style={{
            left: bug.left,
            top: bug.top,
            width: bug.size,
            height: bug.size,
            animationDuration: `${bug.duration}s`,
            animationDelay: `${bug.delay}s`,
            zIndex: 2,
          }}
        />
      ))}
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-[#0e1a14]/70 via-[#1c3028]/30 to-transparent" />
      {(isFull ? [10, 18, 26, 70, 78, 86] : [14, 76, 84]).map((left, i) => (
        <span
          key={`fern-${i}`}
          className="bg-fx-grass-blade"
          style={{
            left: `${left}%`,
            height: isFull ? 16 + (i % 3) * 5 : 12,
            background: "linear-gradient(180deg, #7a9a78, #3a5648)",
            animationDelay: `${i * 0.4}s`,
            zIndex: 2,
          }}
        />
      ))}
    </>
  );
}

/** 라벤더 언덕 — 보라 능선·꽃·나비 */
function LavenderHillScene({ isFull }: { isFull: boolean }) {
  return (
    <>
      {/* far: sky + sun + clouds */}
      <span
        className="bg-fx-haze absolute left-[12%] top-[4%] h-[20%] w-[50%] bg-white/55"
        style={{ animationDuration: "11s" }}
      />
      <span
        className="bg-fx-sun"
        style={{
          right: isFull ? "14%" : "12%",
          top: isFull ? "8%" : "7%",
          width: isFull ? 28 : 16,
          height: isFull ? 28 : 16,
          background:
            "radial-gradient(circle at 38% 38%, #fff8e0, #f0d78c 55%, #e8c070 100%)",
          boxShadow: "0 0 24px rgba(240, 215, 140, 0.45)",
        }}
      />
      <span
        className="bg-fx-haze absolute right-[8%] top-[16%] h-[14%] w-[28%] bg-[#f4e8ff]/40"
        style={{ animationDelay: "1.8s", animationDuration: "13s" }}
      />

      {/* far: distant hills + cottage */}
      <span className="bg-fx-hill absolute bottom-[42%] left-[-8%] h-[16%] w-[48%] bg-[#c8b0d8]/40 blur-[1.5px]" />
      <span className="bg-fx-hill absolute bottom-[40%] right-[-6%] h-[18%] w-[44%] bg-[#b498cc]/35 blur-[1.5px]" />
      <CottageSvg
        className="absolute"
        style={{
          left: isFull ? "58%" : "56%",
          bottom: isFull ? "46%" : "44%",
          width: isFull ? 42 : 26,
          height: isFull ? 32 : 20,
          opacity: 0.7,
          filter: "blur(0.3px)",
        }}
      />

      {/* mid: lavender rows */}
      <span className="bg-fx-hill absolute bottom-[26%] left-[-10%] h-[26%] w-[62%] bg-[#9a78b8]/55" />
      <span className="bg-fx-hill absolute bottom-[22%] right-[-12%] h-[28%] w-[58%] bg-[#8664a8]/58" />
      {(isFull
        ? [
            { left: "2%", bottom: "28%", w: 72, h: 44, delay: "0s" },
            { left: "18%", bottom: "32%", w: 64, h: 40, delay: "0.4s" },
            { left: "36%", bottom: "26%", w: 78, h: 48, delay: "0.9s" },
            { left: "54%", bottom: "34%", w: 60, h: 38, delay: "0.2s" },
            { left: "70%", bottom: "28%", w: 70, h: 42, delay: "1.1s" },
            { left: "84%", bottom: "24%", w: 56, h: 36, delay: "0.6s" },
          ]
        : [
            { left: "4%", bottom: "28%", w: 46, h: 28, delay: "0s" },
            { left: "32%", bottom: "30%", w: 50, h: 30, delay: "0.5s" },
            { left: "62%", bottom: "26%", w: 48, h: 28, delay: "0.9s" },
            { left: "82%", bottom: "24%", w: 40, h: 24, delay: "0.3s" },
          ]
      ).map((clump, i) => (
        <LavenderClump
          key={`clump-${i}`}
          className="bg-fx-tree bg-fx-tree-sway absolute"
          style={{
            left: clump.left,
            bottom: clump.bottom,
            width: clump.w,
            height: clump.h,
            animationDelay: clump.delay,
            animationDuration: `${8 + (i % 3)}s`,
            zIndex: 1,
          }}
          tone={i % 3 === 0 ? "lilac" : i % 3 === 1 ? "violet" : "mauve"}
        />
      ))}

      {/* near: path, fence, grass */}
      <span className="pointer-events-none absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#8fad7a]/50 via-[#c4b496]/22 to-transparent" />
      <span className="absolute bottom-[8%] left-1/2 h-[12%] w-[42%] -translate-x-1/2 rounded-[100%] bg-[#d4c4a0]/45 blur-[0.5px]" />
      <span className="absolute bottom-[6%] left-1/2 h-[7%] w-[30%] -translate-x-1/2 rounded-[100%] bg-[#e2d4b4]/50" />
      <FenceSvg
        className="absolute bottom-[7%] left-[4%]"
        style={{ width: isFull ? "28%" : "30%", height: isFull ? 28 : 18 }}
      />
      <FenceSvg
        className="absolute bottom-[7%] right-[3%]"
        style={{ width: isFull ? "26%" : "28%", height: isFull ? 26 : 16 }}
      />

      {(isFull ? [6, 12, 18, 24, 68, 74, 80, 88] : [8, 16, 72, 84]).map(
        (left, i) => (
          <span
            key={`lg-${i}`}
            className="bg-fx-grass-blade"
            style={{
              left: `${left}%`,
              height: isFull ? 13 + (i % 3) * 5 : 10 + (i % 2) * 3,
              background:
                i % 2 === 0
                  ? "linear-gradient(180deg, #b7cfa4, #6d8a5e)"
                  : "linear-gradient(180deg, #9caf88, #5a734c)",
              animationDelay: `${i * 0.28}s`,
              zIndex: 2,
            }}
          />
        ),
      )}

      {(isFull ? LAVENDER_PETALS_FULL : LAVENDER_PETALS_PREVIEW).map(
        (petal, i) => (
          <span
            key={`lp-${i}`}
            className="bg-fx-petal"
            style={
              {
                left: petal.left,
                width: petal.size,
                height: petal.size * 0.7,
                background:
                  "radial-gradient(circle at 30% 30%, #f4e8ff, #c4a0dc)",
                "--bg-drift": `${petal.drift ?? 20}px`,
                animationDuration: `${petal.duration}s`,
                animationDelay: `${petal.delay}s`,
                zIndex: 2,
              } as CSSProperties
            }
          />
        ),
      )}

      <span
        className="bg-fx-butterfly"
        style={{
          left: isFull ? "38%" : "36%",
          top: isFull ? "40%" : "38%",
          animationDelay: "0.3s",
          zIndex: 3,
        }}
      >
        <ButterflySvg tone="lilac" />
      </span>
      {isFull && (
        <span
          className="bg-fx-butterfly"
          style={{
            left: "64%",
            top: "48%",
            width: 11,
            height: 10,
            animationDelay: "1.6s",
            animationDuration: "5.8s",
            zIndex: 3,
          }}
        >
          <ButterflySvg tone="lilac" />
        </span>
      )}
      <span
        className="bg-fx-bird"
        style={{
          left: "92%",
          top: isFull ? "16%" : "14%",
          animationDelay: "2.4s",
        }}
      >
        <BirdSvg />
      </span>
      <span className="bg-fx-ground-glow absolute bottom-[7%] left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-[#c4a0dc]/28 blur-md" />
    </>
  );
}

/** 촛불 서재 — 창·커튼·책장·책상·촛불 */
function CandleStudyScene({ isFull }: { isFull: boolean }) {
  return (
    <>
      {/* far: night through the window */}
      <span className="absolute left-[28%] top-[8%] h-[42%] w-[44%] bg-[#1c283c]" />
      <span className="absolute left-[42%] top-[12%] h-[10%] w-[10%] rounded-full bg-[#fff4d4]/70 blur-[1px]" />
      <span className="absolute left-[34%] top-[18%] h-1 w-1 rounded-full bg-white/80" />
      <span className="absolute left-[58%] top-[15%] h-1.5 w-1.5 rounded-full bg-white/70" />
      <span className="absolute left-[50%] top-[22%] h-1 w-1 rounded-full bg-white/55" />
      <span className="bg-fx-hill absolute left-[28%] top-[34%] h-[16%] w-[22%] bg-[#121a28]/70" />
      <span className="bg-fx-hill absolute left-[46%] top-[32%] h-[18%] w-[26%] bg-[#0e1622]/75" />

      {/* mid: window frame + curtains */}
      <span className="absolute left-[26%] top-[6%] h-[48%] w-[48%] rounded-sm border-[5px] border-[#8a6e54]/90 bg-transparent shadow-[inset_0_0_12px_rgba(20,14,10,0.25)]" />
      <span className="absolute left-[49.5%] top-[8%] h-[44%] w-[1.5%] bg-[#8a6e54]/70" />
      <span className="absolute left-[28%] top-[28%] h-[1.5%] w-[44%] bg-[#8a6e54]/55" />
      <span
        className="bg-fx-curtain absolute left-[24%] top-[6%] h-[50%] w-[10%] rounded-b-full bg-gradient-to-b from-[#c47858]/85 to-[#8a4a38]/80"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="bg-fx-curtain absolute right-[24%] top-[6%] h-[50%] w-[10%] rounded-b-full bg-gradient-to-b from-[#c47858]/80 to-[#8a4a38]/75"
        style={{ animationDelay: "1.4s", animationDuration: "9s" }}
      />
      <span className="absolute left-[26%] top-[6%] h-[4%] w-[48%] rounded-t-sm bg-[#6e5644]" />
      <span className="bg-fx-glass-sheen absolute left-[28%] top-[10%] h-[40%] w-[44%] opacity-60" />

      {/* sill plants */}
      <span className="absolute left-[30%] top-[48%] h-[4%] w-[40%] rounded-sm bg-[#6e5644]" />
      <SillPot
        className="absolute left-[32%] top-[40%]"
        style={{ width: isFull ? 22 : 14, height: isFull ? 22 : 14 }}
      />
      <SillPot
        className="absolute left-[58%] top-[41%]"
        style={{ width: isFull ? 18 : 12, height: isFull ? 18 : 12 }}
        tone="sage"
      />

      {/* mid: bookshelves */}
      <BookshelfSvg
        className="absolute bottom-[10%] left-[1%]"
        style={{
          width: isFull ? "24%" : "26%",
          height: isFull ? "78%" : "74%",
        }}
      />
      <BookshelfSvg
        className="absolute bottom-[10%] right-[1%]"
        style={{
          width: isFull ? "22%" : "24%",
          height: isFull ? "72%" : "68%",
        }}
        variant="right"
      />

      {/* picture frame */}
      <span className="absolute left-[40%] top-[58%] h-[12%] w-[10%] rounded-[2px] border-2 border-[#c4a882]/70 bg-[#3a4a38]/50" />
      <span className="absolute left-[41.5%] top-[60%] h-[6%] w-[7%] rounded-full bg-[#9caf88]/40" />

      {/* near: desk + candle + mug + book */}
      <span className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-[#1a1410]/85 via-[#2a2218]/45 to-transparent" />
      <span className="absolute bottom-[8%] left-[22%] right-[22%] h-[10%] rounded-sm bg-[#5a4638]" />
      <span className="absolute bottom-[16%] left-[24%] right-[24%] h-[2%] bg-[#6e5644]" />
      <span
        className="bg-fx-candle absolute left-[48%] bottom-[18%]"
        style={{
          width: isFull ? 9 : 6,
          height: isFull ? 16 : 11,
          zIndex: 2,
        }}
      />
      <span className="absolute left-[47%] bottom-[16%] h-[3%] w-[6%] rounded-sm bg-[#e8dcc8]/70" />
      <span className="absolute left-[34%] bottom-[17%] h-[7%] w-[7%] rounded-b-md rounded-t-sm bg-[#e8a598]/75" />
      <span className="absolute left-[35%] bottom-[23%] h-[2%] w-[5%] rounded-full border border-[#e8a598]/80" />
      <span className="absolute right-[32%] bottom-[17%] h-[2.5%] w-[12%] rounded-[1px] bg-[#f5f0e8]/80" />
      <span className="absolute right-[30%] bottom-[19%] h-[5%] w-[10%] rotate-[-8deg] rounded-[1px] bg-[#d8c8a8]/75" />

      <span
        className="bg-fx-haze absolute left-[40%] top-[42%] h-[26%] w-[28%] bg-[#ffc878]/22"
        style={{ animationDuration: "7s" }}
      />
      {(isFull ? DUST_FULL : DUST_PREVIEW).map((mote, i) => (
        <span
          key={`dust-${i}`}
          className="bg-fx-dust"
          style={
            {
              left: mote.left,
              width: mote.size,
              height: mote.size,
              "--bg-drift": `${mote.drift ?? 8}px`,
              animationDuration: `${mote.duration}s`,
              animationDelay: `${mote.delay}s`,
              zIndex: 3,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

function ForestTree({
  className = "",
  style,
  dark = false,
}: {
  className?: string;
  style?: CSSProperties;
  dark?: boolean;
}) {
  const needle = dark ? "#1a2e24" : "#2a4638";
  const trunk = dark ? "#1a1410" : "#3a2a20";
  return (
    <svg className={className} style={style} viewBox="0 0 80 140" fill="none" aria-hidden>
      <path d="M38 138 L42 138 L41 78 L39 78 Z" fill={trunk} />
      <path d="M40 22 L62 58 L18 58 Z" fill={needle} opacity="0.95" />
      <path d="M40 38 L68 78 L12 78 Z" fill={needle} opacity="0.88" />
      <path d="M40 58 L72 102 L8 102 Z" fill={needle} opacity="0.8" />
    </svg>
  );
}

function LighthouseSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 28 56" fill="none" aria-hidden>
      <path d="M10 54 H18 L16 18 H12 Z" fill="#e8dcc8" />
      <path d="M12 36 H16 L15.4 26 H12.6 Z" fill="#c47858" />
      <rect x="9" y="14" width="10" height="6" fill="#6d655c" />
      <path d="M8 14 L14 6 L20 14 Z" fill="#c47858" />
      <circle cx="14" cy="11" r="2.2" fill="#ffe8c0" />
    </svg>
  );
}

function SailboatSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 56 42" fill="none" aria-hidden>
      <path d="M8 32 L48 32 L42 38 H14 Z" fill="#4a3a30" />
      <path d="M26 32 V8" stroke="#6e5644" strokeWidth="1.6" />
      <path d="M27 10 L42 30 H27 Z" fill="#f5f0e8" opacity="0.9" />
      <path d="M25 12 L12 30 H25 Z" fill="#e8a598" opacity="0.85" />
    </svg>
  );
}

function PierSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 48" fill="none" aria-hidden>
      <rect x="4" y="10" width="6" height="34" rx="1" fill="#6e5644" />
      <rect x="28" y="12" width="6" height="32" rx="1" fill="#5a4638" />
      <rect x="52" y="14" width="6" height="30" rx="1" fill="#6e5644" />
      <rect x="76" y="18" width="5" height="26" rx="1" fill="#5a4638" />
      <rect x="2" y="8" width="88" height="6" rx="1" fill="#c4a882" />
      <rect x="2" y="16" width="82" height="3" rx="1" fill="#b8946e" opacity="0.7" />
    </svg>
  );
}

function SeaRockSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 28" fill="none" aria-hidden>
      <path d="M4 24 C10 10 22 6 34 12 C42 6 54 8 60 24 Z" fill="#4a5248" />
      <path d="M14 24 C18 16 28 14 36 18 C40 14 48 16 52 24 Z" fill="#6d655c" opacity="0.7" />
    </svg>
  );
}

function ForestCabinSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 56 40" fill="none" aria-hidden>
      <path d="M6 22 L28 6 L50 22" fill="#5a4638" />
      <path d="M10 20 H46 V38 H10 Z" fill="#3a2e26" />
      <rect x="24" y="24" width="8" height="14" fill="#2a2218" />
      <rect x="14" y="24" width="6" height="6" fill="#f0d78c" opacity="0.55" />
      <rect x="36" y="24" width="6" height="6" fill="#1c2830" />
    </svg>
  );
}

function FernSvg({
  className = "",
  style,
  flip = false,
}: {
  className?: string;
  style?: CSSProperties;
  flip?: boolean;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <g transform={flip ? "translate(40,0) scale(-1,1)" : undefined}>
        <path d="M8 36 C14 24 18 14 22 6" stroke="#4a6a50" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 30 C18 28 22 24 24 20" stroke="#6d8a5e" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M14 24 C20 22 24 18 26 14" stroke="#7a9a78" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M16 18 C22 16 26 12 28 9" stroke="#6d8a5e" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="24" cy="20" rx="3" ry="2" fill="#6d8a5e" opacity="0.8" />
        <ellipse cx="26" cy="14" rx="2.6" ry="1.8" fill="#7a9a78" opacity="0.85" />
      </g>
    </svg>
  );
}

function MushroomSvg({
  className = "",
  style,
  tone = "red",
}: {
  className?: string;
  style?: CSSProperties;
  tone?: "red" | "amber";
}) {
  const cap = tone === "amber" ? "#e8a598" : "#c47858";
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 22 H14 V14 H10 Z" fill="#e8dcc8" />
      <path d="M4 14 C4 8 8 6 12 6 C16 6 20 8 20 14 Z" fill={cap} />
      <circle cx="9" cy="10" r="1.3" fill="#f5f0e8" opacity="0.85" />
      <circle cx="14" cy="9" r="1.1" fill="#f5f0e8" opacity="0.8" />
    </svg>
  );
}

function LavenderClump({
  className = "",
  style,
  tone = "lilac",
}: {
  className?: string;
  style?: CSSProperties;
  tone?: "lilac" | "violet" | "mauve";
}) {
  const head =
    tone === "violet" ? "#8a64b0" : tone === "mauve" ? "#c4a0dc" : "#a878c8";
  const headLite =
    tone === "violet" ? "#b090d0" : tone === "mauve" ? "#ead4f4" : "#d8b8e8";
  return (
    <svg className={className} style={style} viewBox="0 0 80 56" fill="none" aria-hidden>
      <path d="M18 54 C20 36 22 22 24 12" stroke="#5a734c" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M32 54 C33 34 34 20 35 8" stroke="#6d8a5e" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M46 54 C45 32 44 18 43 10" stroke="#5a734c" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M60 54 C58 36 56 22 54 14" stroke="#6d8a5e" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="12" rx="6" ry="10" fill={head} />
      <ellipse cx="35" cy="9" rx="7" ry="12" fill={headLite} />
      <ellipse cx="43" cy="11" rx="6" ry="10" fill={head} />
      <ellipse cx="54" cy="14" rx="5.5" ry="9" fill={headLite} />
      <ellipse cx="29" cy="16" rx="4" ry="7" fill={headLite} opacity="0.85" />
    </svg>
  );
}

function CottageSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 48 36" fill="none" aria-hidden>
      <path d="M4 20 L24 6 L44 20" fill="#c4a882" />
      <path d="M8 18 H40 V34 H8 Z" fill="#e8dcc8" />
      <rect x="20" y="22" width="8" height="12" fill="#8a6e54" />
      <rect x="12" y="22" width="5" height="5" fill="#8ba4b4" />
      <rect x="31" y="22" width="5" height="5" fill="#8ba4b4" />
    </svg>
  );
}

function FenceSvg({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 40" fill="none" aria-hidden>
      <rect x="6" y="8" width="5" height="28" rx="1" fill="#c4a882" />
      <rect x="38" y="6" width="5" height="30" rx="1" fill="#b8946e" />
      <rect x="70" y="8" width="5" height="28" rx="1" fill="#c4a882" />
      <rect x="102" y="7" width="5" height="29" rx="1" fill="#b8946e" />
      <rect x="4" y="16" width="108" height="3.5" rx="1" fill="#d4c4a0" />
      <rect x="4" y="26" width="108" height="3" rx="1" fill="#c4a882" />
    </svg>
  );
}

function SillPot({
  className = "",
  style,
  tone = "leaf",
}: {
  className?: string;
  style?: CSSProperties;
  tone?: "leaf" | "sage";
}) {
  const leaf = tone === "sage" ? "#9caf88" : "#6d8a5e";
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" aria-hidden>
      <ellipse cx="16" cy="12" rx="7" ry="8" fill={leaf} />
      <ellipse cx="11" cy="14" rx="5" ry="6" fill="#8fad7a" />
      <ellipse cx="21" cy="14" rx="5" ry="6" fill="#7a9168" />
      <path d="M10 22 H22 L20 30 H12 Z" fill="#c47858" />
    </svg>
  );
}

function BookshelfSvg({
  className = "",
  style,
  variant = "left",
}: {
  className?: string;
  style?: CSSProperties;
  variant?: "left" | "right";
}) {
  const books =
    variant === "right"
      ? ["#c47858", "#8ba4b4", "#9caf88", "#e8a598", "#6d8a5e", "#d4c4a0"]
      : ["#8ba4b4", "#c47858", "#6d8a5e", "#e8c9ee", "#d4c4a0", "#e8a598"];
  return (
    <svg className={className} style={style} viewBox="0 0 60 140" fill="none" aria-hidden>
      <rect x="4" y="4" width="52" height="132" rx="3" fill="#5a4638" />
      <rect x="7" y="7" width="46" height="126" fill="#3a2e26" />
      {[18, 44, 70, 96, 122].map((y, row) => (
        <g key={y}>
          <rect x="7" y={y} width="46" height="3" fill="#6e5644" />
          {books.map((color, i) => (
            <rect
              key={`${y}-${i}`}
              x={10 + i * 7}
              y={y - 14 + (i % 3)}
              width="5.5"
              height={15 - (i % 3)}
              fill={color}
              opacity={0.92}
            />
          ))}
          {row === 1 && (
            <ellipse cx="40" cy={y - 8} rx="6" ry="5" fill="#9caf88" opacity="0.85" />
          )}
        </g>
      ))}
    </svg>
  );
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
