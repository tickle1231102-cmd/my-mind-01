/**
 * 배경 테마 정의 — 기본 3종(무료) + 상점 구매 테마(CSS 장면).
 * 상점 배경(`sceneClass`)은 공간감·입체감·생동감·디테일(깊이 레이어 + 장면 요소 + 상시 애니메이션)이 필수.
 * @see .cursor/rules/animated-store-backgrounds.mdc
 */

export type BackgroundId =
  | "room"
  | "beige"
  | "grassland"
  | "night-sky"
  | "rainy-window"
  | "cherry-garden"
  | "first-snow"
  | "sunset-sea"
  | "misty-forest"
  | "lavender-hill"
  | "candle-study";

export type BackgroundDef = {
  id: BackgroundId;
  label: string;
  src?: string;
  imageClass?: string;
  /** CSS gradient / atmospheric scene (no PNG) */
  sceneClass?: string;
  /** 항상 보유 — 상점 구매 불필요 */
  defaultFree?: boolean;
};

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: "room",
    label: "햇살 창가",
    src: "/background-room.png",
    imageClass: "object-cover object-[center_60%]",
    defaultFree: true,
  },
  {
    id: "beige",
    label: "몽글 베이지",
    src: "/background-beige.png",
    imageClass: "object-cover object-center",
    defaultFree: true,
  },
  {
    id: "grassland",
    label: "푸른 초원",
    src: "/background-grass.png",
    imageClass: "object-cover object-[center_65%]",
    defaultFree: true,
  },
  {
    id: "night-sky",
    label: "밤하늘",
    sceneClass: "bg-scene-night-sky",
  },
  {
    id: "rainy-window",
    label: "비 오는 창가",
    sceneClass: "bg-scene-rainy-window",
  },
  {
    id: "cherry-garden",
    label: "벚꽃 정원",
    sceneClass: "bg-scene-cherry-garden",
  },
  {
    id: "first-snow",
    label: "첫눈",
    sceneClass: "bg-scene-first-snow",
  },
  {
    id: "sunset-sea",
    label: "노을 바다",
    sceneClass: "bg-scene-sunset-sea",
  },
  {
    id: "misty-forest",
    label: "안개 숲",
    sceneClass: "bg-scene-misty-forest",
  },
  {
    id: "lavender-hill",
    label: "라벤더 언덕",
    sceneClass: "bg-scene-lavender-hill",
  },
  {
    id: "candle-study",
    label: "촛불 서재",
    sceneClass: "bg-scene-candle-study",
  },
];

export const DEFAULT_FREE_BACKGROUND_IDS: BackgroundId[] = BACKGROUNDS.filter(
  (bg) => bg.defaultFree,
).map((bg) => bg.id);

export function getBackgroundById(id: string): BackgroundDef | undefined {
  return BACKGROUNDS.find((bg) => bg.id === id);
}

export function getBackgroundLabel(id: string): string {
  return getBackgroundById(id)?.label ?? id;
}
