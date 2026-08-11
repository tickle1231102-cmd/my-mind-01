"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { BgmProvider } from "@/components/BgmProvider";
import { UiClickSoundProvider } from "@/components/UiClickSoundProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BgmProvider>
        <UiClickSoundProvider>{children}</UiClickSoundProvider>
      </BgmProvider>
    </AuthProvider>
  );
}
