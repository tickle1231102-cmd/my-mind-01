"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const BGM_STORAGE_KEY = "healing-garden-bgm";
const BGM_SRC = "/sounds/cute-bgm.m4a";

/** 레이아웃에 두고 라우트 이동해도 끊기지 않도록 모듈 싱글톤으로 유지 */
let sharedBgm: HTMLAudioElement | null = null;

function getSharedBgm(): HTMLAudioElement {
  if (typeof window === "undefined") {
    throw new Error("BGM is only available in the browser");
  }
  if (!sharedBgm) {
    sharedBgm = new Audio(BGM_SRC);
    sharedBgm.preload = "auto";
    sharedBgm.loop = true;
    sharedBgm.volume = 0.22;
  }
  return sharedBgm;
}

type BgmContextValue = {
  enabled: boolean;
  toggle: () => void;
  ensurePlaying: () => void;
};

const BgmContext = createContext<BgmContextValue | null>(null);

export function BgmProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(BGM_STORAGE_KEY);
    setEnabled(saved !== "off");
  }, []);

  const ensurePlaying = useCallback(() => {
    const saved = window.localStorage.getItem(BGM_STORAGE_KEY);
    if (saved === "off") return;
    void getSharedBgm().play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem(BGM_STORAGE_KEY, next ? "on" : "off");
      const bgm = getSharedBgm();
      if (next) {
        void bgm.play().catch(() => {});
      } else {
        bgm.pause();
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ enabled, toggle, ensurePlaying }),
    [enabled, toggle, ensurePlaying],
  );

  return <BgmContext.Provider value={value}>{children}</BgmContext.Provider>;
}

export function useBgm(): BgmContextValue {
  const ctx = useContext(BgmContext);
  if (!ctx) {
    throw new Error("useBgm must be used within BgmProvider");
  }
  return ctx;
}
