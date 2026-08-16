/**
 * 상점 카탈로그 — 포션으로 구매 가능한 꾸미기·감각 아이템.
 * pay-to-win 금지: 성장/HP/레벨에 영향 없는 순수 꾸미기·분위기만.
 */

import type { BackgroundId } from "@/lib/backgrounds";

export type StoreCategory =
  | "decorating"
  | "sensory"
  | "garden"
  | "reaction"
  | "journey"
  | "milestone";

export type StoreItemKind =
  | "background"
  | "potSkin"
  | "bgmPack"
  | "gardenProp"
  | "flowerType"
  | "reactionSkin"
  | "journeyTheme"
  | "undergroundLight"
  | "milestoneFrame"
  | "wateringCanSkin"
  | "gratitudeCard";

export type StoreItem = {
  id: string;
  category: StoreCategory;
  kind: StoreItemKind;
  name: string;
  description: string;
  price: number;
  /** kind별 unlock 대상 ID (backgroundId, potSkinId 등) */
  unlockId: string;
  /** 아직 구현 전 — 카탈로그만 노출 */
  comingSoon?: boolean;
};

/** v1 — 꾸미기(배경·화분) + 감각(BGM 스텁) */
export const STORE_CATALOG: StoreItem[] = [
  // ── Category 1: Decorating — backgrounds ──
  {
    id: "store-bg-night-sky",
    category: "decorating",
    kind: "background",
    name: "밤하늘",
    description: "별이 반짝이는 고요한 밤하늘 배경",
    price: 15,
    unlockId: "night-sky",
  },
  {
    id: "store-bg-rainy-window",
    category: "decorating",
    kind: "background",
    name: "비 오는 창가",
    description: "잔잔한 빗소리가 떠오르는 창가 풍경",
    price: 15,
    unlockId: "rainy-window",
  },
  {
    id: "store-bg-cherry-garden",
    category: "decorating",
    kind: "background",
    name: "벚꽃 정원",
    description: "부드러운 벚꽃 향기가 느껴지는 봄 정원",
    price: 20,
    unlockId: "cherry-garden",
  },
  {
    id: "store-bg-first-snow",
    category: "decorating",
    kind: "background",
    name: "첫눈",
    description: "하얀 눈송이가 내리는 겨울 아침",
    price: 20,
    unlockId: "first-snow",
  },
  {
    id: "store-bg-sunset-sea",
    category: "decorating",
    kind: "background",
    name: "노을 바다",
    description: "하루가 천천히 가라앉는 따뜻한 노을 해변",
    price: 18,
    unlockId: "sunset-sea",
  },
  {
    id: "store-bg-misty-forest",
    category: "decorating",
    kind: "background",
    name: "안개 숲",
    description: "이슬과 반딧불이 숨 쉬는 고요한 숲속",
    price: 18,
    unlockId: "misty-forest",
  },
  {
    id: "store-bg-lavender-hill",
    category: "decorating",
    kind: "background",
    name: "라벤더 언덕",
    description: "보라빛 바람이 스치는 늦은 오후 언덕",
    price: 20,
    unlockId: "lavender-hill",
  },
  {
    id: "store-bg-candle-study",
    category: "decorating",
    kind: "background",
    name: "촛불 서재",
    description: "촛불과 책장 사이에서 마음이 따뜻해지는 밤",
    price: 20,
    unlockId: "candle-study",
  },
  // ── Category 1: Decorating — pot skins ──
  {
    id: "store-pot-ceramic",
    category: "decorating",
    kind: "potSkin",
    name: "도자기 화분",
    description: "따뜻한 크림 도자기 질감의 화분",
    price: 12,
    unlockId: "ceramic",
  },
  {
    id: "store-pot-glass",
    category: "decorating",
    kind: "potSkin",
    name: "유리 화분",
    description: "맑고 투명한 유리 화분 — 뿌리가 살짝 보여요",
    price: 12,
    unlockId: "glass",
  },
  {
    id: "store-pot-wood",
    category: "decorating",
    kind: "potSkin",
    name: "나무 화분",
    description: "자연 나무결의 아늑한 화분",
    price: 15,
    unlockId: "wood",
  },
  {
    id: "store-pot-vintage-tin",
    category: "decorating",
    kind: "potSkin",
    name: "빈티지 틴",
    description: "옛 정원에서 가져온 듯한 빈티지 금속 화분",
    price: 18,
    unlockId: "vintage-tin",
  },
  // ── Category 3: Sensory — BGM (coming soon, no extra audio files yet) ──
  {
    id: "store-bgm-rain",
    category: "sensory",
    kind: "bgmPack",
    name: "빗소리 앰비언트",
    description: "창가 빗소리와 함께하는 잔잔한 배경음",
    price: 25,
    unlockId: "bgm-rain",
    comingSoon: true,
  },
  {
    id: "store-bgm-forest",
    category: "sensory",
    kind: "bgmPack",
    name: "숲속 앰비언트",
    description: "새소리와 바람이 섞인 숲속 분위기",
    price: 25,
    unlockId: "bgm-forest",
    comingSoon: true,
  },
];

export type PotSkinId =
  | "default"
  | "ceramic"
  | "glass"
  | "wood"
  | "vintage-tin";

export const POT_SKINS: {
  id: PotSkinId;
  label: string;
  defaultFree?: boolean;
}[] = [
  { id: "default", label: "기본 화분", defaultFree: true },
  { id: "ceramic", label: "도자기" },
  { id: "glass", label: "유리" },
  { id: "wood", label: "나무" },
  { id: "vintage-tin", label: "빈티지 틴" },
];

export const DEFAULT_FREE_POT_SKIN_ID: PotSkinId = "default";

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  decorating: "꾸미기",
  sensory: "감각",
  garden: "정원",
  reaction: "반응",
  journey: "여정",
  milestone: "이정표",
};

export function getStoreItemById(id: string): StoreItem | undefined {
  return STORE_CATALOG.find((item) => item.id === id);
}

export function getStoreItemsByCategory(
  category: StoreCategory,
): StoreItem[] {
  return STORE_CATALOG.filter((item) => item.category === category);
}

export function getPotSkinLabel(id: string): string {
  return POT_SKINS.find((s) => s.id === id)?.label ?? id;
}

/** store item unlockId → background id 검증 */
export function isBackgroundUnlockId(id: string): id is BackgroundId {
  return [
    "night-sky",
    "rainy-window",
    "cherry-garden",
    "first-snow",
    "sunset-sea",
    "misty-forest",
    "lavender-hill",
    "candle-study",
  ].includes(id);
}
