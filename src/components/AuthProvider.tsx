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
import type { User } from "@supabase/supabase-js";
import { hydrateGameFromCloud } from "@/lib/cloud-sync";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    const {
      data: { user: next },
    } = await supabase.auth.getUser();
    setUser(next);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { user: next },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(next);
      setLoading(false);
      if (next) {
        await hydrateGameFromCloud();
      }
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      setLoading(false);
      if (
        next &&
        (event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "TOKEN_REFRESHED")
      ) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          await hydrateGameFromCloud();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo(
    () => ({ user, loading, signOut, refresh }),
    [user, loading, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
