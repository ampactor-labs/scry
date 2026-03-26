import { riskLevelClasses } from "../lib/format";

interface RiskBadgeProps {
  level: string;
}

/** Small pill badge showing a risk level with appropriate color. */
export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${riskLevelClasses(level)}`}
    >
      {level}
    </span>
  );
}
