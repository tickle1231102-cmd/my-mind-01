"use client";

import type { ReactNode } from "react";
import { BgmProvider } from "@/components/BgmProvider";
import { UiClickSoundProvider } from "@/components/UiClickSoundProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BgmProvider>
      <UiClickSoundProvider>{children}</UiClickSoundProvider>
    </BgmProvider>
  );
}
