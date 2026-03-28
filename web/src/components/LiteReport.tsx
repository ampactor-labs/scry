import { useState } from "react";
import type { LiteScanResult } from "../lib/api";
import { truncateAddress, formatAge, formatPercent } from "../lib/format";
import { RiskDial } from "./RiskDial";
import { RiskBadge } from "./RiskBadge";
import { CheckRow } from "./CheckRow";
import { ShareButton } from "./ShareButton";

interface LiteReportProps {
  data: LiteScanResult;
  onGetFullReport: () => void;
}

/** Assembles the free lite scan report. */
export function LiteReport({
  data,
  onGetFullReport: _onGetFullReport,
}: LiteReportProps) {
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    navigator.clipboard.writeText(data.mint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* --- Hero section: dial + token identity --- */}
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

          <div className="flex items-center justify-center gap-2 text-muted text-xs font-mono">
            <span>{truncateAddress(data.mint, 6)}</span>
            <button
              onClick={copyAddress}
              className="text-accent hover:text-accent-hover transition-colors"
              title="Copy address"
            >
              {copied ? (
                <span className="text-success">✓</span>
              ) : (
                <span>⧉</span>
              )}
            </button>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted text-center max-w-lg leading-relaxed">
          {data.summary}
        </p>

        {/* Share + Delta */}
        <ShareButton
          mint={data.mint}
          name={data.name}
          symbol={data.symbol}
          score={data.risk_score}
          level={data.risk_level}
        />

        {data.risk_score_delta !== null && data.risk_score_delta !== 0 && (
          <div
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              data.risk_score_delta > 0
                ? "bg-danger/20 text-danger"
                : "bg-success/20 text-success"
            }`}
          >
            {data.risk_score_delta > 0 ? "▲" : "▼"}{" "}
            {Math.abs(data.risk_score_delta)} pts since last scan
          </div>
        )}
      </div>

      {/* --- Degraded banner --- */}
      {data.degraded && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 flex items-start gap-3 text-sm text-warning">
          <span className="mt-0.5 shrink-0">⚠</span>
          <div>
            <span className="font-semibold">Partial data — </span>
            some checks could not be completed:{" "}
            {data.degraded_checks.join(", ")}.
          </div>
        </div>
      )}

      {/* --- Key facts grid --- */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-text mb-4">Key Checks</h2>
        <div className="divide-y divide-border">
          <CheckRow
            label="Authorities Renounced"
            value={
              data.authorities_renounced
                ? "Yes"
                : data.trusted_authority
                  ? "No (trusted issuer)"
                  : "No"
            }
            risk={
              data.authorities_renounced || data.trusted_authority
                ? "SAFE"
                : "WARNING"
            }
            icon="🔑"
          />
          {data.trusted_authority && (
            <CheckRow
              label="Trusted Authority"
              value="Yes"
              risk="SAFE"
              icon="🛡"
            />
          )}
          <CheckRow
            label="Has Liquidity"
            value={data.has_liquidity ? data.liquidity_rating : "None"}
            risk={
              data.has_liquidity
                ? data.liquidity_rating === "DEEP" ||
                  data.liquidity_rating === "MEDIUM"
                  ? "SAFE"
                  : "WARNING"
                : "DANGEROUS"
            }
            icon="💧"
          />
          <CheckRow
            label="Can Sell"
            value={data.can_sell ? "Yes" : "No — possible honeypot"}
            risk={data.can_sell ? "SAFE" : "DANGEROUS"}
            icon="🍯"
          />
          <CheckRow
            label="Token Age"
            value={formatAge(data.token_age_hours)}
            risk={
              data.token_age_hours === null
                ? "WARNING"
                : data.token_age_hours < 24
                  ? "DANGEROUS"
                  : data.token_age_hours < 168
                    ? "WARNING"
                    : "SAFE"
            }
            icon="⏱"
          />
          <CheckRow
            label="Top-10 Concentration"
            value={formatPercent(data.top_10_concentration)}
            risk={
              data.top_10_concentration === null
                ? "WARNING"
                : data.top_10_concentration > 60
                  ? "DANGEROUS"
                  : data.top_10_concentration > 30
                    ? "WARNING"
                    : "SAFE"
            }
            icon="👥"
          />
          <CheckRow
            label="Token-2022"
            value={
              data.is_token_2022
                ? data.has_risky_extensions
                  ? "Yes — risky extensions"
                  : "Yes — clean"
                : "No"
            }
            risk={
              data.is_token_2022 && data.has_risky_extensions
                ? "DANGEROUS"
                : "SAFE"
            }
            icon="⚙"
          />
        </div>
      </div>

      {/* --- Full report loading indicator --- */}
      <div className="rounded-xl border border-accent/30 bg-accent/10 p-4 text-center">
        <p className="text-sm text-muted">
          Full detailed report loading below…
        </p>
      </div>
    </div>
  );
}
