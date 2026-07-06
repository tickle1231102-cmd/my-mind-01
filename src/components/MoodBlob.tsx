import type { MoodKind } from "@/lib/mood-log";

const MOOD_STYLES: Record<
  MoodKind,
  { fill: string; stroke: string; mouth: string; eyes: string; extra?: string }
> = {
  joy: {
    fill: "#F6D56B",
    stroke: "#4A3F35",
    eyes: "M9 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4M18 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4",
    mouth: "M10 17.5c2 2.5 8 2.5 10 0",
  },
  love: {
    fill: "#F3A6B8",
    stroke: "#4A3F35",
    eyes: "M9 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4M18 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4",
    mouth: "M10 17.5c2 2.5 8 2.5 10 0",
    extra: "M8.5 14.5c.8 1 1.8 1 2.5 0M17 14.5c.8 1 1.8 1 2.5 0",
  },
  calm: {
    fill: "#A8D8B9",
    stroke: "#4A3F35",
    eyes: "M8.5 12c1.2 0 2.3-.4 3-1.2M16.5 12c1.2 0 2.3-.4 3-1.2",
    mouth: "M11 17.5c1.5 1 4.5 1 6 0",
  },
  neutral: {
    fill: "#9EC5E8",
    stroke: "#4A3F35",
    eyes: "M9 12h2.8M18.2 12H21",
    mouth: "M11 17.5h10",
  },
  anxious: {
    fill: "#C9A8E8",
    stroke: "#4A3F35",
    eyes: "M8.5 11.5l2 2M15.5 11.5l2 2M10.5 13.5l1-2M17.5 13.5l1-2",
    mouth: "M11 18c1.5-1 4.5-1 6 0",
    extra: "M7 9.5v2M24 9.5v2",
  },
  sad: {
    fill: "#7EB0E8",
    stroke: "#4A3F35",
    eyes: "M8.5 12l3-1.5M18.5 12l-3-1.5",
    mouth: "M10.5 18.5c1.5-1.5 5.5-1.5 7 0",
    extra: "M9 10.5l2 1M19 10.5l-2 1",
  },
  angry: {
    fill: "#E85C5C",
    stroke: "#4A3F35",
    eyes: "M9 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4M18 11.5c0 .8.6 1.4 1.4 1.4s1.4-.6 1.4-1.4",
    mouth: "M10 19c2-2 8-2 10 0",
    extra: "M8 8.5c.5 1 1 1.5 1.5 1.5M22 8.5c-.5 1-1 1.5-1.5 1.5",
  },
};

type MoodBlobProps = {
  mood: MoodKind;
  size?: number;
  className?: string;
};

export function MoodBlob({ mood, size = 52, className = "" }: MoodBlobProps) {
  const style = MOOD_STYLES[mood];

  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <path
        d="M16 3c6.5 1.2 11.5 6.8 11.5 13.4 0 7.4-5.2 12.6-11.5 12.6S4.5 23.8 4.5 16.4C4.5 9.8 9.5 4.2 16 3Z"
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d={style.eyes}
        fill="none"
        stroke={style.stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d={style.mouth}
        fill="none"
        stroke={style.stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {style.extra && (
        <path
          d={style.extra}
          fill="none"
          stroke={style.stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
