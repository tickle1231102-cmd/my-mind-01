import type { PlantState } from "@/lib/plant-state";
import {
  getAllChatLogs,
  replaceAllChatLogs,
  type StoredMessage,
} from "@/lib/chat-history";
import { getPlantState, setPlantState } from "@/lib/plant-state";
import { createClient } from "@/lib/supabase/client";

export const CLOUD_SYNC_EVENT = "healing-garden-cloud-synced";

type MindGameRow = {
  level: number;
  hp: number;
  wilted_by_negative: boolean;
  chat_logs: Record<string, StoredMessage[]>;
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let hydrating = false;

function mergeChatLogs(
  local: Record<string, StoredMessage[]>,
  remote: Record<string, StoredMessage[]>,
): Record<string, StoredMessage[]> {
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const out: Record<string, StoredMessage[]> = {};
  for (const key of keys) {
    const a = local[key] ?? [];
    const b = remote[key] ?? [];
    out[key] = a.length >= b.length ? a : b;
  }
  return out;
}

export async function ensureMindProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    null;

  const { error } = await supabase.from("mind_profiles").upsert(
    {
      user_id: user.id,
      email: user.email ?? null,
      display_name: displayName,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[mind] profile upsert failed", error.message);
  }
  return user;
}

export async function hydrateGameFromCloud(): Promise<boolean> {
  if (typeof window === "undefined" || hydrating) return false;
  hydrating = true;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    await ensureMindProfile();

    const { data, error } = await supabase
      .from("mind_game_state")
      .select("level, hp, wilted_by_negative, chat_logs")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[mind] load game state failed", error.message);
      return false;
    }

    const localPlant = getPlantState();
    const localLogs = getAllChatLogs();

    if (!data) {
      await pushGameStateToCloud(localPlant, localLogs);
      return true;
    }

    const remote = data as MindGameRow;
    const remoteLogs =
      remote.chat_logs && typeof remote.chat_logs === "object"
        ? remote.chat_logs
        : {};

    const hasRemoteProgress =
      remote.level > 0 ||
      remote.hp > 0 ||
      Object.keys(remoteLogs).length > 0;

    if (!hasRemoteProgress) {
      const hasLocal =
        localPlant.level > 0 ||
        localPlant.hp > 0 ||
        Object.keys(localLogs).length > 0;
      if (hasLocal) {
        await pushGameStateToCloud(localPlant, localLogs);
      }
      return true;
    }

    // DB 우선 + 채팅은 날짜별 더 긴 쪽 병합
    const mergedLogs = mergeChatLogs(localLogs, remoteLogs);
    setPlantState(
      {
        level: remote.level,
        hp: remote.hp,
        wiltedByNegative: remote.wilted_by_negative,
      },
      { skipCloud: true },
    );
    replaceAllChatLogs(mergedLogs, { skipCloud: true });

    // 병합된 채팅이 remote보다 많으면 다시 업로드
    const remoteCount = Object.values(remoteLogs).reduce(
      (n, msgs) => n + msgs.length,
      0,
    );
    const mergedCount = Object.values(mergedLogs).reduce(
      (n, msgs) => n + msgs.length,
      0,
    );
    if (mergedCount > remoteCount) {
      await pushGameStateToCloud(
        {
          level: remote.level,
          hp: remote.hp,
          wiltedByNegative: remote.wilted_by_negative,
        },
        mergedLogs,
      );
    }

    window.dispatchEvent(new Event(CLOUD_SYNC_EVENT));
    return true;
  } finally {
    hydrating = false;
  }
}

export async function pushGameStateToCloud(
  plant: PlantState = getPlantState(),
  chatLogs: Record<string, StoredMessage[]> = getAllChatLogs(),
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("mind_game_state").upsert(
    {
      user_id: user.id,
      level: plant.level,
      hp: plant.hp,
      wilted_by_negative: plant.wiltedByNegative,
      chat_logs: chatLogs,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[mind] save game state failed", error.message);
  }
}

/** 짧은 debounce로 연속 저장 요청을 묶음 */
export function scheduleCloudSave(delayMs = 800) {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void pushGameStateToCloud();
  }, delayMs);
}
