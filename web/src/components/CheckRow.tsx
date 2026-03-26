type RiskLevel = "SAFE" | "WARNING" | "DANGEROUS";

interface CheckRowProps {
  label: string;
  value: string;
  risk: RiskLevel;
  icon?: string;
}

const riskDot: Record<RiskLevel, string> = {
  SAFE: "bg-success",
  WARNING: "bg-warning",
  DANGEROUS: "bg-danger",
};

const defaultIcon = "◈";

/** Single row displaying a check label, value, and risk indicator dot. */
export function CheckRow({ label, value, risk, icon }: CheckRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {/* Icon */}
      <span className="text-muted text-base w-5 text-center shrink-0">
        {icon ?? defaultIcon}
      </span>

      {/* Label */}
      <span className="flex-1 text-sm text-muted">{label}</span>

      {/* Value */}
      <span className="text-sm text-text font-medium font-mono">{value}</span>

      {/* Risk dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${riskDot[risk]}`}
        title={risk}
      />
    </div>
  );
}
