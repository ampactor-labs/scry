/** Maps risk score (0-100) to a hex color for the dial. */
export function scoreColor(score: number): string {
  if (score <= 20) return "#10b981"; // green
  if (score <= 40) return "#f59e0b"; // yellow
  if (score <= 60) return "#f97316"; // orange
  if (score <= 80) return "#ef4444"; // red
  return "#991b1b"; // dark red
}

/** Maps risk level string to tailwind classes. */
export function riskLevelClasses(level: string): string {
  switch (level) {
    case "LOW":
      return "bg-emerald-500/20 text-emerald-400";
    case "MEDIUM":
      return "bg-amber-500/20 text-amber-400";
    case "HIGH":
      return "bg-red-500/20 text-red-400";
    case "CRITICAL":
      return "bg-red-900/30 text-red-300";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}

/** Truncate address for display: So11...1112 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Format token age in hours to a readable string. */
export function formatAge(hours: number | null): string {
  if (hours === null) return "Unknown";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 720)}mo`;
}

/** Format a percentage with 1 decimal. */
export function formatPercent(value: number | null): string {
  if (value === null) return "N/A";
  return `${value.toFixed(1)}%`;
}
