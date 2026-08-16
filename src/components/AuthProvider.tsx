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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("auth timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    try {
      const {
        data: { user: next },
      } = await withTimeout(supabase.auth.getUser(), 4000);
      setUser(next);
    } catch (error) {
      console.error("[mind] auth refresh failed", error);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const {
          data: { user: next },
        } = await withTimeout(supabase.auth.getUser(), 4000);
        if (!mounted) return;
        setUser(next);
        if (next) await hydrateGameFromCloud();
      } catch (error) {
        console.error("[mind] auth init failed", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void init();

    if (!supabase) return () => { mounted = false; };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      setLoading(false);
      if (
        next &&
        (event === "SIGNED_IN" || event === "INITIAL_SESSION")
      ) {
        await hydrateGameFromCloud();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
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
