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
import {
  loadUiClickEnabled,
  playUiClick,
  setUiClickEnabled,
} from "@/lib/uiClickSound";

const DEBOUNCE_MS = 60;

const INTERACTIVE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  '[role="button"]:not([aria-disabled="true"])',
  'input[type="submit"]:not([disabled])',
  "label[for]",
].join(", ");

function findInteractiveTarget(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;

  const el = target.closest(INTERACTIVE_SELECTOR);
  if (!el) return null;

  if (el.hasAttribute("data-no-click-sound") || el.closest("[data-no-click-sound]")) {
    return null;
  }

  if (
    el.matches(
      "button[disabled], [aria-disabled='true'], input[disabled], a[aria-disabled='true']",
    )
  ) {
    return null;
  }

  return el;
}

type UiClickSoundContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const UiClickSoundContext = createContext<UiClickSoundContextValue | null>(null);

export function UiClickSoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(loadUiClickEnabled());
  }, []);

  useEffect(() => {
    let lastPlay = 0;

    function handleClick(event: MouseEvent) {
      if (event.button !== 0) return;
      if (!findInteractiveTarget(event.target)) return;

      const now = Date.now();
      if (now - lastPlay < DEBOUNCE_MS) return;
      lastPlay = now;

      playUiClick();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setUiClickEnabled(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle]);

  return (
    <UiClickSoundContext.Provider value={value}>
      {children}
    </UiClickSoundContext.Provider>
  );
}

export function useUiClickSound(): UiClickSoundContextValue {
  const ctx = useContext(UiClickSoundContext);
  if (!ctx) {
    throw new Error("useUiClickSound must be used within UiClickSoundProvider");
  }
  return ctx;
}
