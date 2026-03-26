import { useEffect, useRef } from "react";
import { scoreColor } from "../lib/format";

interface RiskDialProps {
  score: number;
  level: string;
}

const SIZE = 200;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
// 270-degree arc: gap at bottom (45° on each side)
const ARC_DEGREES = 270;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS * (ARC_DEGREES / 360);

// The arc starts at -225deg from 12-o'clock (i.e. 135deg from east = bottom-left)
// SVG rotate: start at 135deg (bottom-left gap start), sweep 270deg clockwise
const ROTATION = 135; // degrees

/**
 * Hero animated SVG dial showing risk score 0-100 as a 270-degree arc.
 * Uses CSS stroke-dashoffset animation defined in index.css (.animate-dial-fill).
 */
export function RiskDial({ score, level }: RiskDialProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = scoreColor(clampedScore);

  // Offset: 0 = full arc, CIRCUMFERENCE = empty arc
  const targetOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  const fgRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;

    // Set CSS custom properties for the keyframe animation
    el.style.setProperty("--dial-circumference", `${CIRCUMFERENCE}`);
    el.style.setProperty("--dial-offset", `${targetOffset}`);

    // Reset so animation re-triggers on score change
    el.classList.remove("animate-dial-fill");
    void (el as unknown as HTMLElement).offsetWidth; // force reflow
    el.classList.add("animate-dial-fill");
  }, [clampedScore, targetOffset]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`Risk score ${clampedScore} — ${level}`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${2 * Math.PI * RADIUS}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATION} ${cx} ${cy})`}
        />

        {/* Foreground arc — animated via CSS */}
        <circle
          ref={fgRef}
          cx={cx}
          cy={cy}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${2 * Math.PI * RADIUS}`}
          strokeDashoffset={CIRCUMFERENCE}
          strokeLinecap="round"
          transform={`rotate(${ROTATION} ${cx} ${cy})`}
          style={{ transition: "stroke 0.3s ease" }}
        />

        {/* Score number */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="42"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          {clampedScore}
        </text>

        {/* Risk level label */}
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-muted)"
          fontSize="13"
          fontWeight="500"
          fontFamily="var(--font-sans)"
          letterSpacing="0.08em"
        >
          {level}
        </text>
      </svg>
    </div>
  );
}
