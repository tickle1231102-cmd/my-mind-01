export type PotBubbleKind = "comfort" | "empathy" | "checkin";

type PotBubbleLine = {
  kind: PotBubbleKind;
  /** `{name}` 자리에 화분 이름 삽입. 없으면 생략해도 자연스러운 문장 */
  text: string;
};

const LINES: PotBubbleLine[] = [
  // 위로
  { kind: "comfort", text: "오늘도 여기까지 온 너, 정말 잘했어." },
  { kind: "comfort", text: "천천히 가도 괜찮아. 나는 옆에 있을게." },
  { kind: "comfort", text: "힘들면 잠깐 쉬어도 돼. 뿌리처럼 쉬어가자." },
  { kind: "comfort", text: "네 마음도 소중해. 나는 그걸 알아." },
  { kind: "comfort", text: "비가 와도 괜찮아. 그다음에 더 단단해지니까." },
  { kind: "comfort", text: "{name}이(가) 응원하고 있어. 넌 혼자가 아니야." },

  // 공감
  { kind: "empathy", text: "그런 날도 있지… 나도 이해해." },
  { kind: "empathy", text: "말해 주지 않아도, 마음이 무거울 수 있어." },
  { kind: "empathy", text: "기쁜 일도, 슬픈 일도 다 여기 내려놓아도 돼." },
  { kind: "empathy", text: "완벽하지 않아도 괜찮아. 자라는 중이니까." },
  { kind: "empathy", text: "네 속도가 정답이야. 서두르지 마." },
  { kind: "empathy", text: "오늘 마음이 복잡해도, {name}은(는) 들어줄게." },

  // 안부
  { kind: "checkin", text: "지금 기분은 어때?" },
  { kind: "checkin", text: "오늘 하루, 어땠어?" },
  { kind: "checkin", text: "물 한 모금 마셨어? 나는 햇살이 필요해 ☀️" },
  { kind: "checkin", text: "잠깐, 깊게 숨 쉬어볼까?" },
  { kind: "checkin", text: "요즘 잘 지내고 있어?" },
  { kind: "checkin", text: "{name}한테 오늘 있었던 일 들려줄래?" },
];

function hasBatchim(name: string): boolean {
  const last = name.charAt(name.length - 1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function fillName(text: string, potName: string): string {
  const name = potName.trim() || "나";
  const batchim = hasBatchim(name);
  return text
    .replaceAll("{name}이(가)", batchim ? `${name}이` : `${name}가`)
    .replaceAll("{name}은(는)", batchim ? `${name}은` : `${name}는`)
    .replaceAll("{name}한테", `${name}한테`)
    .replaceAll("{name}", name);
}

/** 직전과 다른 말풍선 한 줄 뽑기 */
export function pickPotBubble(
  potName: string,
  previousText?: string | null,
): { kind: PotBubbleKind; text: string } {
  const pool =
    previousText && LINES.length > 1
      ? LINES.filter((line) => fillName(line.text, potName) !== previousText)
      : LINES;
  const line = pool[Math.floor(Math.random() * pool.length)] ?? LINES[0];
  return {
    kind: line.kind,
    text: fillName(line.text, potName),
  };
}

/** 다음 말풍선까지 대기 시간 (ms) */
export function nextBubbleDelayMs(): number {
  return 18000 + Math.floor(Math.random() * 16000); // 18~34초
}

export const BUBBLE_VISIBLE_MS = 5200;
