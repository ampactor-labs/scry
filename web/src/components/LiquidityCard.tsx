import type { LiquidityRating } from "../lib/api";
import { formatPercent, truncateAddress } from "../lib/format";

interface LiquidityCardProps {
  primary_pool: string | null;
  liquidity_rating: LiquidityRating;
  lp_locked: boolean;
  lp_lock_percentage: number | null;
  price_impact_pct: number | null;
}

const ratingColor: Record<LiquidityRating, string> = {
  DEEP: "text-success",
  MEDIUM: "text-text",
  LOW: "text-warning",
  MINIMAL: "text-danger",
};

/** Card showing formatted liquidity details from the full report. */
export function LiquidityCard({
  primary_pool,
  liquidity_rating,
  lp_locked,
  lp_lock_percentage,
  price_impact_pct,
}: LiquidityCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
        <span>◈</span> Liquidity
      </h3>
      <dl className="space-y-2">
        <Row
          label="Rating"
          value={
            <span className={`font-semibold ${ratingColor[liquidity_rating]}`}>
              {liquidity_rating}
            </span>
          }
        />
        <Row
          label="Primary Pool"
          value={
            <span className="font-mono text-xs">
              {primary_pool ? truncateAddress(primary_pool) : "—"}
            </span>
          }
        />
        <Row
          label="LP Locked"
          value={
            <span className={lp_locked ? "text-success" : "text-danger"}>
              {lp_locked
                ? `Yes${lp_lock_percentage != null ? ` (${formatPercent(lp_lock_percentage)})` : ""}`
                : "No"}
            </span>
          }
        />
        <Row
          label="Price Impact (10%)"
          value={
            <span className={priceImpactColor(price_impact_pct)}>
              {price_impact_pct != null
                ? formatPercent(price_impact_pct)
                : "N/A"}
            </span>
          }
        />
      </dl>
    </div>
  );
}

function priceImpactColor(pct: number | null): string {
  if (pct === null) return "text-muted";
  if (pct < 5) return "text-success";
  if (pct < 15) return "text-warning";
  return "text-danger";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}
