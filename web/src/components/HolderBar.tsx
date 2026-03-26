interface HolderBarProps {
  percentage: number;
}

/** Horizontal bar showing top-10 holder concentration as a percentage fill. */
export function HolderBar({ percentage }: HolderBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));

  let fillColor: string;
  if (clamped < 30) {
    fillColor = "bg-success";
  } else if (clamped < 60) {
    fillColor = "bg-warning";
  } else {
    fillColor = "bg-danger";
  }

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted mb-1.5">
        <span>Top-10 Concentration</span>
        <span className="font-mono font-medium text-text">
          {clamped.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${fillColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
