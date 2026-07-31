/**
 * 홈 화면 화분(새싹)의 레벨/HP를 저장한다.
 * 기존에는 React state로만 존재해 새로고침 시 사라졌는데,
 * Journey 지도가 실제 성장 이력을 반영하려면 영속화가 필요하다.
 */

export type PlantState = {
  level: number;
  hp: number;
  wiltedByNegative: boolean;
};

const PLANT_STATE_KEY = "healing-garden-plant-state";

const DEFAULT_STATE: PlantState = { level: 0, hp: 0, wiltedByNegative: false };

export function getPlantState(): PlantState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(PLANT_STATE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PlantState>;
    return {
      level:
        typeof parsed.level === "number" && parsed.level >= 0
          ? parsed.level
          : 0,
      hp: typeof parsed.hp === "number" && parsed.hp >= 0 ? parsed.hp : 0,
      wiltedByNegative: Boolean(parsed.wiltedByNegative),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function setPlantState(state: PlantState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLANT_STATE_KEY, JSON.stringify(state));
}
