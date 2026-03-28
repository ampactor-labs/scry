import type { FullCheckResult } from "../lib/api";
import {
  truncateAddress,
  formatAge,
  formatPercent,
  scoreColor,
} from "../lib/format";
import { RiskDial } from "./RiskDial";
import { RiskBadge } from "./RiskBadge";
import { CheckRow } from "./CheckRow";
import { HolderBar } from "./HolderBar";
import { LiquidityCard } from "./LiquidityCard";
import { ShareButton } from "./ShareButton";
import { getExtensionExplainer } from "../lib/token2022";

interface FullReportProps {
  data: FullCheckResult;
}

const severityClasses: Record<string, string> = {
  CRITICAL: "border-critical/40 bg-critical/10 text-red-300",
  HIGH: "border-danger/40 bg-danger/10 text-danger",
  MEDIUM: "border-warning/40 bg-warning/10 text-warning",
  LOW: "border-border bg-bg text-muted",
  INFO: "border-border bg-bg text-muted",
};

/** Full report — shows detailed checks, score breakdown, alerts. */
export function FullReport({ data }: FullReportProps) {
  const { checks } = data;
  const checkedAt = data.checked_at
    ? new Date(data.checked_at).toLocaleString()
    : "Unknown";
  const alerts = data.alerts ?? [];
  const riskFactors = data.risk_factors ?? [];
  const scoreBreakdown = data.score_breakdown ?? {};

  return (
    <div className="animate-fade-in space-y-6">
      {/* --- Hero --- */}
      <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center gap-4">
        <RiskDial score={data.risk_score} level={data.risk_level} />

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-text">
              {data.name || "Unknown Token"}
            </h1>
            {data.symbol && (
              <span className="text-muted text-sm">{data.symbol}</span>
            )}
            <RiskBadge level={data.risk_level} />
          </div>
          <p className="font-mono text-xs text-muted">
            {truncateAddress(data.mint, 8)}
          </p>
        </div>

        <p className="text-sm text-muted text-center max-w-lg leading-relaxed">
          {data.summary}
        </p>

        <div className="flex items-center gap-3">
          <ShareButton
            mint={data.mint}
            name={data.name}
            symbol={data.symbol}
            score={data.risk_score}
            level={data.risk_level}
          />
          <span className="text-xs text-muted">Checked at {checkedAt}</span>
        </div>
      </div>

      {/* --- Alerts --- */}
      {alerts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-text">Alerts</h2>
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${severityClasses[alert.severity] ?? severityClasses["INFO"]}`}
            >
              <span className="shrink-0 font-semibold">[{alert.severity}]</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </section>
      )}

      {/* --- Risk factors --- */}
      {riskFactors.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-5 space-y-2">
          <h2 className="text-sm font-semibold text-text mb-3">Risk Factors</h2>
          <ul className="space-y-1.5">
            {riskFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <span className="text-danger mt-0.5 shrink-0">▪</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Score breakdown --- */}
      {Object.keys(scoreBreakdown).length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text mb-4">
            Score Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(scoreBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([key, pts]) => {
                const pct =
                  data.risk_score > 0
                    ? Math.min(100, (pts / data.risk_score) * 100)
                    : 0;
                const color = scoreColor(pts * 2);
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-mono text-text">+{pts}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* --- Authorities --- */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Authorities</h2>
        <div className="divide-y divide-border">
          <CheckRow
            label="Mint Authority"
            value={
              checks.mint_authority.authority
                ? truncateAddress(checks.mint_authority.authority)
                : "Renounced"
            }
            risk={checks.mint_authority.risk === "SAFE" ? "SAFE" : "DANGEROUS"}
            icon="🔑"
          />
          <CheckRow
            label="Freeze Authority"
            value={
              checks.freeze_authority.authority
                ? truncateAddress(checks.freeze_authority.authority)
                : "Renounced"
            }
            risk={
              checks.freeze_authority.risk === "SAFE" ? "SAFE" : "DANGEROUS"
            }
            icon="❄"
          />
          {checks.metadata && (
            <>
              <CheckRow
                label="Metadata Mutable"
                value={checks.metadata.mutable ? "Yes" : "No"}
                risk={checks.metadata.mutable ? "WARNING" : "SAFE"}
                icon="📝"
              />
              <CheckRow
                label="Update Authority"
                value={
                  checks.metadata.update_authority
                    ? truncateAddress(checks.metadata.update_authority)
                    : "—"
                }
                risk={checks.metadata.update_authority ? "WARNING" : "SAFE"}
                icon="✏"
              />
            </>
          )}
        </div>
      </section>

      {/* --- Top Holders --- */}
      {checks.top_holders && (
        <section className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Holder Analysis</h2>

          <HolderBar percentage={checks.top_holders.top_10_percentage} />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat
              label="Top-1 %"
              value={formatPercent(checks.top_holders.top_1_percentage)}
            />
            <Stat
              label="Est. Holders"
              value={
                checks.top_holders.holder_count_estimate?.toLocaleString() ??
                "N/A"
              }
            />
          </div>

          {checks.top_holders.top_holders_detail.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted mb-2">Top Holders</p>
              <div className="space-y-1.5">
                {checks.top_holders.top_holders_detail
                  .slice(0, 5)
                  .map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs font-mono text-muted"
                    >
                      <span>{truncateAddress(h.address, 5)}</span>
                      <span className="text-text">
                        {formatPercent(h.percentage)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- Liquidity --- */}
      {checks.liquidity && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-text">Liquidity</h2>
          <LiquidityCard
            primary_pool={checks.liquidity.primary_pool}
            liquidity_rating={checks.liquidity.liquidity_rating}
            lp_locked={checks.liquidity.lp_locked ?? false}
            lp_lock_percentage={checks.liquidity.lp_lock_percentage}
            price_impact_pct={checks.liquidity.price_impact_pct}
          />
          {checks.liquidity.lp_lock_expiry && (
            <p className="text-xs text-muted px-1">
              LP lock expires:{" "}
              <span className="text-text font-mono">
                {new Date(checks.liquidity.lp_lock_expiry).toLocaleDateString()}
              </span>
            </p>
          )}
        </section>
      )}

      {/* --- Honeypot --- */}
      {checks.honeypot && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text mb-3">
            Honeypot Check
          </h2>
          <div className="divide-y divide-border">
            <CheckRow
              label="Can Sell"
              value={checks.honeypot.can_sell ? "Yes" : "No"}
              risk={checks.honeypot.can_sell ? "SAFE" : "DANGEROUS"}
              icon="🍯"
            />
            {checks.honeypot.sell_tax_bps !== null && (
              <CheckRow
                label="Sell Tax"
                value={`${(checks.honeypot.sell_tax_bps / 100).toFixed(2)}%`}
                risk={
                  checks.honeypot.sell_tax_bps === 0
                    ? "SAFE"
                    : checks.honeypot.sell_tax_bps < 500
                      ? "WARNING"
                      : "DANGEROUS"
                }
                icon="💸"
              />
            )}
          </div>
        </section>
      )}

      {/* --- Token-2022 Extensions --- */}
      {checks.is_token_2022 && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-text mb-3">
            Token-2022 Extensions
          </h2>
          {checks.token_2022_extensions.length === 0 ? (
            <p className="text-sm text-muted">No extensions detected.</p>
          ) : (
            <div className="space-y-2">
              {checks.token_2022_extensions.map((ext, i) => {
                const explainer = getExtensionExplainer(ext.type);
                return (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2.5 text-sm ${
                      ext.risk === "DANGEROUS"
                        ? "border-danger/30 bg-danger/5"
                        : ext.risk === "WARNING"
                          ? "border-warning/30 bg-warning/5"
                          : "border-border bg-bg"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`shrink-0 font-mono font-semibold ${
                          ext.risk === "DANGEROUS"
                            ? "text-danger"
                            : ext.risk === "WARNING"
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {ext.type}
                      </span>
                      <span className="text-muted flex-1">
                        {ext.description}
                      </span>
                    </div>
                    {explainer && (
                      <p className="mt-1.5 text-xs text-muted/80 leading-relaxed pl-0.5">
                        {explainer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* --- Supply info --- */}
      <section className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-text mb-3">Token Info</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Total Supply"
            value={Number(checks.supply.total).toLocaleString()}
          />
          <Stat label="Decimals" value={String(checks.supply.decimals)} />
          <Stat label="Age" value={formatAge(checks.token_age_hours)} />
          <Stat
            label="Token Standard"
            value={checks.is_token_2022 ? "Token-2022" : "SPL"}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg border border-border px-3 py-2">
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text font-mono font-medium">{value}</p>
    </div>
  );
}
