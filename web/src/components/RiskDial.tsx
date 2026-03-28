import { useEffect, useRef } from "react";
import { scoreColor } from "../lib/format";

interface RiskDialProps {
  score: number;
  level: string;
}

const SIZE = 220;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const ARC_DEGREES = 270;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS * (ARC_DEGREES / 360);
const ROTATION = 135;

/**
 * Hero animated SVG dial showing risk score 0-100 as a 270-degree arc.
 * Thicker stroke with glow effect for visual impact.
 */
export function RiskDial({ score, level }: RiskDialProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = scoreColor(clampedScore);
  const targetOffset = CIRCUMFERENCE * (1 - clampedScore / 100);
  const fgRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = fgRef.current;
    if (!el) return;
    el.style.setProperty("--dial-circumference", `${CIRCUMFERENCE}`);
    el.style.setProperty("--dial-offset", `${targetOffset}`);
    el.classList.remove("animate-dial-fill");
    void (el as unknown as HTMLElement).offsetWidth;
    el.classList.add("animate-dial-fill");
  }, [clampedScore, targetOffset]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const glowId = `dial-glow-${clampedScore}`;

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`Risk score ${clampedScore} — ${level}`}
        role="img"
        className="drop-shadow-lg"
      >
        <defs>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
          opacity={0.6}
        />

        {/* Foreground arc with glow */}
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
          filter={`url(#${glowId})`}
          style={{ transition: "stroke 0.3s ease" }}
        />

        {/* Score number — large and bold */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="54"
          fontWeight="800"
          fontFamily="var(--font-sans)"
        >
          {clampedScore}
        </text>

        {/* Risk level label — colored to match arc */}
        <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="14"
          fontWeight="600"
          fontFamily="var(--font-sans)"
          letterSpacing="0.1em"
          opacity={0.9}
        >
          {level}
        </text>
      </svg>
    </div>
  );
}
