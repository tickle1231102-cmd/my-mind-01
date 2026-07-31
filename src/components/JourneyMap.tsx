"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  TERRAIN_LABELS,
  type JourneyMilestone,
  type JourneyRealm,
  type JourneyTerrain,
} from "@/lib/journey";

type JourneyMapProps = {
  milestones: JourneyMilestone[];
  realm: JourneyRealm;
  claimedIds: Set<string>;
  nextTargetId: string | null;
  onSelect: (milestone: JourneyMilestone) => void;
};

const MAP_W = 340;
const NODE_SPACING = 128;
const PAD_BOTTOM = 110;
const PAD_TOP = 56;

type NodePoint = {
  milestone: JourneyMilestone;
  x: number;
  y: number;
  index: number;
};

type GlyphKind =
  | "lock"
  | "gift"
  | "sprout"
  | "bloom"
  | "pot"
  | "spark"
  | "root";

function glyphKind(
  milestone: JourneyMilestone,
  claimed: boolean,
  realm: JourneyRealm,
): GlyphKind {
  if (!milestone.achieved) return "lock";
  if (milestone.potionReward > 0 && !claimed) return "gift";
  if (realm === "underground") return "root";
  if (milestone.id.includes("level-5") || milestone.id.includes("horizon"))
    return "bloom";
  if (milestone.id.includes("level")) return "sprout";
  if (milestone.id.includes("root") || milestone.id.startsWith("ug-"))
    return "pot";
  return "spark";
}

/** Hand-drawn style glyphs for map nodes (no emoji). */
function NodeGlyph({
  kind,
  achieved,
  underground,
}: {
  kind: GlyphKind;
  achieved: boolean;
  underground: boolean;
}) {
  const ink = achieved
    ? "#FDFBF7"
    : underground
      ? "#9a8b74"
      : "#a8a296";
  const soft = achieved
    ? underground
      ? "#e8dfd0"
      : "#d4e4c8"
    : "#d9d3c8";

  switch (kind) {
    case "lock":
      return (
        <g aria-hidden>
          <rect
            x={-7}
            y={-2}
            width={14}
            height={11}
            rx={2.5}
            fill={soft}
            stroke={ink}
            strokeWidth={1.6}
          />
          <path
            d="M-4.5 -2 V-7 a4.5 4.5 0 0 1 9 0 V-2"
            fill="none"
            stroke={ink}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <circle cx={0} cy={3} r={1.6} fill={ink} />
          <line
            x1={0}
            y1={4.5}
            x2={0}
            y2={7}
            stroke={ink}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      );
    case "gift":
      return (
        <g aria-hidden>
          <rect
            x={-9}
            y={-3}
            width={18}
            height={12}
            rx={2}
            fill={soft}
            stroke={ink}
            strokeWidth={1.5}
          />
          <rect
            x={-10}
            y={-7}
            width={20}
            height={5}
            rx={1.5}
            fill={ink}
            opacity={0.85}
          />
          <rect x={-1.2} y={-7} width={2.4} height={16} fill="#FDFBF7" opacity={0.9} />
          <path
            d="M0 -7 C-5 -12,-8 -8,-4 -5 M0 -7 C5 -12,8 -8,4 -5"
            fill="none"
            stroke="#FDFBF7"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </g>
      );
    case "sprout":
      return (
        <g aria-hidden>
          <path
            d="M0 8 C0 2,0 -2,0 -4"
            fill="none"
            stroke={ink}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d="M0 -1 C-8 -6,-10 2,-2 4"
            fill={soft}
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <path
            d="M0 -2 C7 -8,11 -1,3 3"
            fill={soft}
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={-5} r={1.4} fill={ink} />
        </g>
      );
    case "bloom":
      return (
        <g aria-hidden>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-5.5}
              rx={3.2}
              ry={5.2}
              fill={soft}
              stroke={ink}
              strokeWidth={1.2}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx={0} cy={0} r={3.2} fill={ink} />
          <circle cx={0} cy={0} r={1.4} fill="#FDFBF7" />
        </g>
      );
    case "pot":
      return (
        <g aria-hidden>
          <path
            d="M-7 2 L-5 10 H5 L7 2 Z"
            fill={soft}
            stroke={ink}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <rect
            x={-8.5}
            y={-1}
            width={17}
            height={4}
            rx={1.5}
            fill={ink}
            opacity={0.9}
          />
          <path
            d="M0 -1 C0 -6,-6 -9,-7 -5 C-4 -8,0 -7,0 -1"
            fill={soft}
            stroke={ink}
            strokeWidth={1.3}
          />
          <path
            d="M0 -1 C0 -7,7 -10,8 -5 C4 -8,0 -6,0 -1"
            fill={soft}
            stroke={ink}
            strokeWidth={1.3}
          />
        </g>
      );
    case "root":
      return (
        <g aria-hidden>
          <path
            d="M0 -8 C-1 -2,1 2,0 8"
            fill="none"
            stroke={ink}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path
            d="M0 0 C-6 2,-8 8,-5 10"
            fill="none"
            stroke={ink}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path
            d="M0 2 C6 3,8 9,5 11"
            fill="none"
            stroke={ink}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path
            d="M-1 -6 C-8 -4,-9 2,-4 3"
            fill={soft}
            stroke={ink}
            strokeWidth={1.3}
          />
          <path
            d="M1 -5 C8 -4,9 1,4 3"
            fill={soft}
            stroke={ink}
            strokeWidth={1.3}
          />
        </g>
      );
    case "spark":
    default:
      return (
        <g aria-hidden>
          <path
            d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z"
            fill={soft}
            stroke={ink}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={0} r={2} fill={ink} />
        </g>
      );
  }
}

function terrainFill(
  terrain: JourneyTerrain,
  realm: JourneyRealm,
): { fill: string; accent: string } {
  if (realm === "underground") {
    const map: Record<string, { fill: string; accent: string }> = {
      soil: { fill: "#efe6d6", accent: "#c4b49a" },
      cave: { fill: "#e4ddd2", accent: "#a89880" },
      ruins: { fill: "#ddd4c6", accent: "#8a7355" },
      abyss: { fill: "#d0c6b6", accent: "#6b5c4a" },
    };
    return map[terrain] ?? map.soil;
  }
  const map: Record<string, { fill: string; accent: string }> = {
    hill: { fill: "#f5ecd9", accent: "#d4c08a" },
    meadow: { fill: "#e7f0e0", accent: "#9caf88" },
    forest: { fill: "#dcebd7", accent: "#6d8a5e" },
  };
  return map[terrain] ?? map.hill;
}

function buildPathD(points: NodePoint[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function JourneyMap({
  milestones,
  realm,
  claimedIds,
  nextTargetId,
  onSelect,
}: JourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUnderground = realm === "underground";

  const { points, height, pathD, terrainBands } = useMemo(() => {
    const pts: NodePoint[] = milestones.map((milestone, index) => {
      const y = PAD_TOP + (milestones.length - 1 - index) * NODE_SPACING;
      const x = index % 2 === 0 ? MAP_W * 0.3 : MAP_W * 0.7;
      return { milestone, x, y, index };
    });
    const h =
      PAD_TOP + Math.max(milestones.length - 1, 0) * NODE_SPACING + PAD_BOTTOM;

    const bands: { terrain: JourneyTerrain; y0: number; y1: number }[] = [];
    let cursor = 0;
    while (cursor < milestones.length) {
      const terrain = milestones[cursor].terrain;
      let end = cursor;
      while (
        end + 1 < milestones.length &&
        milestones[end + 1].terrain === terrain
      ) {
        end += 1;
      }
      const bandTop =
        end === milestones.length - 1
          ? 0
          : (pts[end].y + pts[end + 1].y) / 2;
      const bandBottom =
        cursor === 0 ? h : (pts[cursor].y + pts[cursor - 1].y) / 2;
      bands.push({
        terrain,
        y0: Math.min(bandTop, bandBottom),
        y1: Math.max(bandTop, bandBottom),
      });
      cursor = end + 1;
    }

    return {
      points: pts,
      height: h,
      pathD: buildPathD(pts),
      terrainBands: bands,
    };
  }, [milestones]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [realm, milestones.length]);

  const pathStroke = isUnderground ? "#a89880" : "#9caf88";
  const pathGlow = isUnderground ? "#c4b49a" : "#c5d4b5";

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-3xl border border-[#e8dcc8] bg-[#FDFBF7]/60 shadow-inner [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <svg
        key={realm}
        viewBox={`0 0 ${MAP_W} ${height}`}
        className="mx-auto block w-full max-w-md"
        role="img"
        aria-label={
          isUnderground ? "뿌리의 여정 지도" : "마음의 여정 지도"
        }
      >
        <defs>
          <filter id="journey-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#4a5248"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {/* Terrain landscape bands */}
        {terrainBands.map((band) => {
          const colors = terrainFill(band.terrain, realm);
          return (
            <g key={`${realm}-${band.terrain}-${band.y0}`}>
              <rect
                x={0}
                y={band.y0}
                width={MAP_W}
                height={Math.max(band.y1 - band.y0, 1)}
                fill={colors.fill}
              />
              {realm === "surface" && band.terrain === "hill" && (
                <>
                  <ellipse
                    cx={48}
                    cy={band.y1 - 28}
                    rx={36}
                    ry={14}
                    fill={colors.accent}
                    opacity={0.35}
                  />
                  <ellipse
                    cx={290}
                    cy={band.y1 - 40}
                    rx={42}
                    ry={16}
                    fill={colors.accent}
                    opacity={0.28}
                  />
                  {/* tiny sprout doodle */}
                  <g opacity={0.5} transform={`translate(70 ${band.y1 - 55})`}>
                    <path
                      d="M0 12 C0 4,0 0,0 -2"
                      fill="none"
                      stroke={colors.accent}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 2 C-6 -2,-7 4,-1 5"
                      fill={colors.accent}
                      opacity={0.7}
                    />
                    <path
                      d="M0 1 C6 -3,8 3,2 5"
                      fill={colors.accent}
                      opacity={0.7}
                    />
                  </g>
                </>
              )}
              {realm === "surface" && band.terrain === "meadow" && (
                <>
                  {[70, 160, 250].map((cx) => (
                    <g key={cx} opacity={0.5}>
                      <line
                        x1={cx}
                        y1={band.y0 + 34}
                        x2={cx}
                        y2={band.y0 + 50}
                        stroke={colors.accent}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                      {[0, 72, 144, 216, 288].map((deg) => (
                        <ellipse
                          key={deg}
                          cx={cx}
                          cy={band.y0 + 28}
                          rx={2.2}
                          ry={4}
                          fill={colors.accent}
                          transform={`rotate(${deg} ${cx} ${band.y0 + 28})`}
                        />
                      ))}
                      <circle
                        cx={cx}
                        cy={band.y0 + 28}
                        r={2}
                        fill="#FDFBF7"
                        opacity={0.8}
                      />
                    </g>
                  ))}
                </>
              )}
              {realm === "surface" && band.terrain === "forest" && (
                <>
                  {[55, 120, 220, 290].map((cx, i) => (
                    <g key={cx} opacity={0.45}>
                      <path
                        d={`M${cx} ${band.y0 + 18 + i * 6} l-12 26 h24 z`}
                        fill={colors.accent}
                      />
                      <path
                        d={`M${cx} ${band.y0 + 28 + i * 6} l-8 16 h16 z`}
                        fill={colors.accent}
                        opacity={0.85}
                      />
                      <rect
                        x={cx - 2}
                        y={band.y0 + 42 + i * 6}
                        width={4}
                        height={10}
                        fill="#8a7355"
                        opacity={0.55}
                      />
                    </g>
                  ))}
                </>
              )}
              {realm === "underground" && (
                <>
                  <path
                    d={`M20 ${(band.y0 + band.y1) / 2} Q40 ${(band.y0 + band.y1) / 2 - 12},55 ${(band.y0 + band.y1) / 2 + 6}`}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={2}
                    opacity={0.25}
                    strokeLinecap="round"
                  />
                  <path
                    d={`M280 ${(band.y0 + band.y1) / 2 + 8} Q300 ${(band.y0 + band.y1) / 2 - 6},320 ${(band.y0 + band.y1) / 2 + 10}`}
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth={2}
                    opacity={0.22}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={40}
                    cy={(band.y0 + band.y1) / 2}
                    r={10}
                    fill={colors.accent}
                    opacity={0.18}
                  />
                  <circle
                    cx={300}
                    cy={(band.y0 + band.y1) / 2 + 16}
                    r={14}
                    fill={colors.accent}
                    opacity={0.15}
                  />
                </>
              )}
              <text
                x={MAP_W / 2}
                y={band.y0 + 22}
                textAnchor="middle"
                fill={colors.accent}
                fontSize={11}
                fontWeight={700}
                opacity={0.85}
              >
                {TERRAIN_LABELS[band.terrain]}
              </text>
            </g>
          );
        })}

        {/* Path — soft underlay then road */}
        {pathD && (
          <>
            <path
              d={pathD}
              fill="none"
              stroke={pathGlow}
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.55}
            />
            <path
              d={pathD}
              fill="none"
              stroke="#FDFBF7"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.95}
            />
            <path
              d={pathD}
              fill="none"
              stroke={pathStroke}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isUnderground ? "10 8" : undefined}
              opacity={0.95}
            />
          </>
        )}

        {/* Nodes */}
        {points.map(({ milestone, x, y }) => {
          const claimed = claimedIds.has(milestone.id);
          const isNext = milestone.id === nextTargetId;
          const achieved = milestone.achieved;
          const fill = achieved
            ? isUnderground
              ? "#8a7355"
              : "#6d8a5e"
            : "#ede8df";
          const ring = isNext
            ? isUnderground
              ? "#c4a574"
              : "#e8a598"
            : achieved
              ? "#FDFBF7"
              : "#d9cfc0";
          const kind = glyphKind(milestone, claimed, realm);
          const plateH = isNext ? 34 : 26;

          return (
            <g
              key={milestone.id}
              transform={`translate(${x}, ${y})`}
              filter="url(#journey-soft)"
              className="cursor-pointer"
              onClick={() => onSelect(milestone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(milestone);
                }
              }}
            >
              {isNext && (
                <circle
                  r={28}
                  fill="none"
                  stroke={ring}
                  strokeWidth={3}
                  opacity={0.7}
                >
                  <animate
                    attributeName="r"
                    values="24;30;24"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.75;0.35;0.75"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle r={24} fill={ring} />
              <circle r={20} fill={fill} />
              <NodeGlyph
                kind={kind}
                achieved={achieved}
                underground={isUnderground}
              />
              <rect
                x={-52}
                y={30}
                width={104}
                height={plateH}
                rx={10}
                fill="#FDFBF7"
                stroke={achieved ? fill : "#e8dcc8"}
                strokeWidth={1.5}
                opacity={0.96}
              />
              <text
                y={isNext ? 43 : 46}
                textAnchor="middle"
                fill={achieved ? "#4a5248" : "#b0aa9e"}
                fontSize={9.5}
                fontWeight={700}
              >
                {truncateLabel(milestone.title, 12)}
              </text>
              {isNext && (
                <text
                  y={56}
                  textAnchor="middle"
                  fill={isUnderground ? "#a89880" : "#e8a598"}
                  fontSize={8}
                  fontWeight={600}
                >
                  다음 목표
                </text>
              )}
              <title>{milestone.title}</title>
            </g>
          );
        })}

        {/* Start marker — below first node plate, keyed by realm to avoid ghost text */}
        {points[0] && (
          <g
            key={`start-${realm}`}
            transform={`translate(${points[0].x}, ${points[0].y + 78})`}
          >
            <rect
              x={-58}
              y={-11}
              width={116}
              height={22}
              rx={11}
              fill="#FDFBF7"
              stroke={isUnderground ? "#d9cfc0" : "#e8dcc8"}
              strokeWidth={1.2}
              opacity={0.95}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fill="#8ba4b4"
              fontWeight={600}
            >
              {isUnderground ? "↓ 표토에서 시작" : "↓ 씨앗에서 시작"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function truncateLabel(text: string, max: number): string {
  const cleaned = text.replace(/\s*·\s*/g, " ");
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}
