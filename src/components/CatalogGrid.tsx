"use client";

import type { ReactNode } from "react";
import { PotionIcon } from "@/components/PotionIcon";

type CatalogGridPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Animal Crossing 스타일 카탈로그 패널 — 밝은 크림 도트 배경 + 행 구분선 */
export function CatalogGridPanel({
  children,
  className = "",
}: CatalogGridPanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#e8e0d4] bg-[#F5F0E8] px-2 py-3 shadow-sm sm:px-3 sm:py-4 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(156,175,136,0.18) 1px, transparent 0)",
        backgroundSize: "14px 14px",
      }}
    >
      {children}
    </div>
  );
}

type CatalogGridProps = {
  children: ReactNode;
  className?: string;
};

export function CatalogGrid({ children, className = "" }: CatalogGridProps) {
  return (
    <div
      className={`grid grid-cols-4 gap-x-1 gap-y-0 [&>*:nth-child(n+5)]:border-t [&>*:nth-child(n+5)]:border-[#d9cfc0]/80 ${className}`}
    >
      {children}
    </div>
  );
}

type CatalogCellProps = {
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  preview: ReactNode;
  /** 가격 표시 (상점). 없으면 가격 줄 숨김 */
  price?: number;
  /** 보유/장착 등 우측 하단 배지 */
  badge?: ReactNode;
  label?: string;
  "aria-label": string;
};

export function CatalogCell({
  selected = false,
  onClick,
  disabled = false,
  preview,
  price,
  badge,
  label,
  "aria-label": ariaLabel,
}: CatalogCellProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={`relative flex flex-col items-center gap-1.5 px-1 py-2.5 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-45`}
    >
      <span
        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16 ${
          selected
            ? "ring-2 ring-[#9caf88] ring-offset-2 ring-offset-[#F5F0E8]"
            : ""
        }`}
      >
        {preview}
        {badge && (
          <span className="absolute -bottom-0.5 -right-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#e8dcc8] bg-white shadow-sm">
            {badge}
          </span>
        )}
      </span>
      {typeof price === "number" && (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold tabular-nums text-[#4a5248] sm:text-xs">
          <PotionIcon className="h-3 w-3 text-[#c98fd6]" />
          {price}
        </span>
      )}
      {label && !price && (
        <span className="max-w-full truncate px-0.5 text-center text-[10px] font-semibold text-[#6d655c]">
          {label}
        </span>
      )}
    </button>
  );
}
