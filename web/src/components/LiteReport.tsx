import { useState } from "react";
import type { LiteScanResult } from "../lib/api";
import { truncateAddress } from "../lib/format";
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
  onGetFullReport,
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
            value={data.has_liquidity ? "Yes" : "None"}
            risk={data.has_liquidity ? "SAFE" : "DANGEROUS"}
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
            value={
              data.token_age_hours === null
                ? "Unknown"
                : data.token_age_hours < 1
                  ? "< 1h"
                  : data.token_age_hours < 24
                    ? `${Math.round(data.token_age_hours)}h`
                    : `${Math.round(data.token_age_hours / 24)}d`
            }
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

      {/* --- Paywall upsell --- */}
      <div className="relative rounded-xl border border-accent/30 bg-surface overflow-hidden">
        {/* Blurred preview of what's behind the paywall */}
        <div className="pointer-events-none select-none blur-sm opacity-40 p-5 space-y-4">
          <div className="rounded-lg bg-bg border border-border p-4">
            <h3 className="text-sm font-semibold text-text mb-2">Score Breakdown</h3>
            <div className="space-y-2">
              <div className="h-2 w-3/4 rounded bg-border"></div>
              <div className="h-2 w-1/2 rounded bg-border"></div>
              <div className="h-2 w-2/3 rounded bg-border"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-bg border border-border p-3">
              <p className="text-xs text-muted">Top Holder</p>
              <p className="text-sm font-mono text-text">████…████</p>
            </div>
            <div className="rounded-lg bg-bg border border-border p-3">
              <p className="text-xs text-muted">LP Lock</p>
              <p className="text-sm font-mono text-text">██.█% locked</p>
            </div>
          </div>
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-[2px] p-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg max-w-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">Full Report</h3>
              <p className="text-muted text-sm mt-1">
                Deep analysis with holder breakdown, LP lock details, score
                breakdown, risk alerts, and Token-2022 audit.
              </p>
            </div>
            <ul className="text-left text-sm text-muted space-y-1.5 mx-auto max-w-xs">
              {[
                "Holder concentration analysis",
                "LP lock status & expiry",
                "Score breakdown by check",
                "Token-2022 extension audit",
                "Risk alerts & change detection",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-accent text-xs">✦</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={onGetFullReport}
              className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-3 font-semibold transition-colors text-sm"
            >
              Unlock Full Report — $0.10 USDC
            </button>
            <p className="text-xs text-muted">
              On-chain payment via Solana. No account needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
