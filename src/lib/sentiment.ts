export type Sentiment = "positive" | "negative" | "neutral";

export const POSITIVE_WORDS = [
  "감사",
  "행복",
  "잘했",
  "최고",
  "좋아",
  "좋은",
  "사랑",
  "희망",
  "기쁨",
  "성공",
  "응원",
  "축하",
  "힐링",
  "긍정",
  "멋지",
  "예쁘",
  "힘내",
  "해냈",
  "달성",
  "완벽",
  "평화",
  "따뜻",
  "포근",
  "즐거",
  "만족",
  "괜찮",
  "회복",
  "치유",
  "자랑",
  "소중",
  "웃음",
  "설렘",
  "편안",
  "고마",
  "잘될",
  "할 수",
  "가능",
  "good",
  "great",
  "love",
  "happy",
  "thanks",
  "hope",
  "proud",
  "nice",
  "wonderful",
];

export const NEGATIVE_WORDS = [
  "짜증",
  "힘들",
  "우울",
  "실패",
  "슬픔",
  "화나",
  "분노",
  "싫어",
  "미워",
  "최악",
  "포기",
  "외로",
  "불안",
  "걱정",
  "피곤",
  "지침",
  "아프",
  "절망",
  "후회",
  "답답",
  "막막",
  "스트레스",
  "무서",
  "두려",
  "괴로",
  "고통",
  "열받",
  "우울해",
  "힘들어",
  "짜증나",
  "싫다",
  "못하",
  "안돼",
  "sad",
  "angry",
  "hate",
  "fail",
  "tired",
  "stress",
  "lonely",
  "awful",
  "bad",
  "depressed",
];

const ANGRY_MARKERS = ["화나", "짜증", "분노", "미워", "싫", "열받", "angry", "hate", "😡"];
const ANXIOUS_MARKERS = ["불안", "걱정", "무서", "두려", "스트레스", "stress", "anxious"];
const LOVE_MARKERS = ["사랑", "감사", "고마", "소중", "😚", "love", "thanks"];

export function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  const pos = POSITIVE_WORDS.some((w) => t.includes(w));
  const neg = NEGATIVE_WORDS.some((w) => t.includes(w));
  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  return "neutral";
}

export function hasAngrySignal(text: string): boolean {
  const t = text.toLowerCase();
  return ANGRY_MARKERS.some((w) => t.includes(w));
}

export function hasAnxiousSignal(text: string): boolean {
  const t = text.toLowerCase();
  return ANXIOUS_MARKERS.some((w) => t.includes(w));
}

export function hasLoveSignal(text: string): boolean {
  const t = text.toLowerCase();
  return LOVE_MARKERS.some((w) => t.includes(w));
}
