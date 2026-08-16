"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PotionIcon } from "@/components/PotionIcon";
import { useAuth } from "@/components/AuthProvider";
import { isDevAccountEmail } from "@/lib/dev-account";
import {
  getPotionBalance,
  POTION_CHANGE_EVENT,
  POTION_LABEL,
} from "@/lib/potion";

type PotionBadgeProps = {
  className?: string;
  /** 없으면 장식만 하고 이동하지 않음 */
  href?: string | null;
};

export function PotionBadge({ className = "", href = "/journey" }: PotionBadgeProps) {
  const { user } = useAuth();
  const unlimited = isDevAccountEmail(user?.email);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(getPotionBalance());

    function onChange(event: Event) {
      const custom = event as CustomEvent<{ balance: number }>;
      if (typeof custom.detail?.balance === "number") {
        setBalance(custom.detail.balance);
      } else {
        setBalance(getPotionBalance());
      }
    }

    window.addEventListener(POTION_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(POTION_CHANGE_EVENT, onChange);
  }, []);

  const label = unlimited ? "무제한" : `${balance}`;
  const aria = unlimited
    ? `${POTION_LABEL} 무제한`
    : `${POTION_LABEL} ${balance}개`;

  const body = (
    <>
      <PotionIcon className="h-4 w-4 text-[#c98fd6]" />
      <span className="text-sm font-bold tabular-nums text-[#4a5248]">
        {label}
      </span>
    </>
  );

  if (!href) {
    return (
      <span
        aria-label={aria}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e8dcc8] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm ${className}`}
      >
        {body}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`${aria} · 여정 보기`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#e8dcc8] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm transition hover:bg-white active:scale-95 ${className}`}
    >
      {body}
    </Link>
  );
}
