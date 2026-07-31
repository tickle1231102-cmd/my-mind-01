"use client";

import type { PotSkinId } from "@/lib/store-catalog";

type PotSkinPreviewProps = {
  skinId: PotSkinId | string;
  className?: string;
};

/**
 * 화분 스킨 미리보기 — 간단한 SVG 실루엣.
 */
export function PotSkinPreview({ skinId, className = "" }: PotSkinPreviewProps) {
  const colors = POT_SKIN_COLORS[skinId as PotSkinId] ?? POT_SKIN_COLORS.default;

  return (
    <svg
      viewBox="0 0 48 52"
      fill="none"
      className={`h-12 w-11 ${className}`}
      aria-hidden
    >
      <ellipse cx="24" cy="46" rx="14" ry="3" fill={colors.shadow} opacity="0.35" />
      <path
        d="M12 28 L14.5 46 Q24 50 33.5 46 L36 28 Z"
        fill={colors.body}
      />
      <rect x="11" y="24" width="26" height="6" rx="2" fill={colors.rim} />
      <ellipse cx="24" cy="24" rx="14" ry="3" fill={colors.rimDark} />
      <ellipse cx="24" cy="23" rx="10" ry="2" fill={colors.soil} opacity="0.6" />
      {skinId === "glass" && (
        <path
          d="M14 30 L16 44 Q24 47 32 44 L34 30"
          stroke="white"
          strokeWidth="0.8"
          opacity="0.35"
        />
      )}
      {skinId === "vintage-tin" && (
        <>
          <rect x="10" y="32" width="28" height="1.5" rx="0.5" fill={colors.accent} opacity="0.5" />
          <rect x="10" y="38" width="28" height="1.5" rx="0.5" fill={colors.accent} opacity="0.5" />
        </>
      )}
      {skinId === "wood" && (
        <path
          d="M14 32 Q24 34 34 32 M14 38 Q24 40 34 38"
          stroke={colors.accent}
          strokeWidth="0.6"
          opacity="0.4"
        />
      )}
      <ellipse cx="24" cy="14" rx="6" ry="8" fill="#9caf88" opacity="0.85" />
      <ellipse cx="24" cy="12" rx="4" ry="5" fill="#b5c9a0" opacity="0.7" />
    </svg>
  );
}

const POT_SKIN_COLORS: Record<
  PotSkinId,
  {
    body: string;
    rim: string;
    rimDark: string;
    soil: string;
    shadow: string;
    accent?: string;
  }
> = {
  default: {
    body: "#c4a882",
    rim: "#d4b896",
    rimDark: "#a88968",
    soil: "#5c4a3a",
    shadow: "#b8956e",
  },
  ceramic: {
    body: "#f5f0e8",
    rim: "#e8e0d4",
    rimDark: "#c4b8a8",
    soil: "#6d5a48",
    shadow: "#d4c8b8",
    accent: "#a3bcc9",
  },
  glass: {
    body: "#b8d4e8",
    rim: "#d4e8f4",
    rimDark: "#8ba4b4",
    soil: "#5c4a3a",
    shadow: "#8ba4b4",
    accent: "#ffffff",
  },
  wood: {
    body: "#a88968",
    rim: "#8a7355",
    rimDark: "#6b5c4a",
    soil: "#4a3d32",
    shadow: "#8a7355",
    accent: "#6b5c4a",
  },
  "vintage-tin": {
    body: "#9caf88",
    rim: "#8fad7a",
    rimDark: "#6d8a5e",
    soil: "#4a5248",
    shadow: "#7a9168",
    accent: "#f5f0e8",
  },
};

export { POT_SKIN_COLORS };
