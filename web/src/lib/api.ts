const TOKENSAFE_URL =
  import.meta.env.VITE_TOKENSAFE_URL ||
  "https://tokensafe-production.up.railway.app";

// ---------------------------------------------------------------------------
// Shared sub-types
// ---------------------------------------------------------------------------

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type LiquidityRating = "DEEP" | "MEDIUM" | "LOW" | "MINIMAL";
export type CheckStatus = "SAFE" | "WARNING" | "DANGEROUS" | "UNKNOWN";

export interface FullReportRef {
  url: string;
  price_usd: number | null;
  payment_protocol: string;
  includes: string[];
}

// ---------------------------------------------------------------------------
// Lite scan response
// ---------------------------------------------------------------------------

export interface LiteScanResult {
  mint: string;
  name: string;
  symbol: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  authorities_renounced: boolean;
  trusted_authority: boolean;
  has_liquidity: boolean;
  can_sell: boolean;
  is_token_2022: boolean;
  has_risky_extensions: boolean;
  data_confidence: "complete" | "partial";
  degraded: boolean;
  degraded_checks: string[];
  token_age_hours: number | null;
  liquidity_rating: LiquidityRating;
  top_10_concentration: number | null;
  risk_score_delta: number | null;
  previous_risk_score: number | null;
  previous_risk_level: RiskLevel | null;
  full_report: FullReportRef;
}

// ---------------------------------------------------------------------------
// Full report response
// ---------------------------------------------------------------------------

export interface AlertEntry {
  type: string;
  severity: string;
  message: string;
}

export interface Token2022Extension {
  type: string;
  risk: CheckStatus;
  description: string;
}

export interface TopHolder {
  address: string;
  percentage: number;
  amount: number;
}

export interface FullCheckResult {
  mint: string;
  name: string | null;
  symbol: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  checked_at: string;
  rpc_slot: number;
  risk_factors: string[];
  score_breakdown: Record<string, number>;
  alerts: AlertEntry[];
  degraded: boolean;
  degraded_checks: string[];
  data_confidence: "complete" | "partial";
  checks: {
    mint_authority: {
      status: CheckStatus;
      authority: string | null;
      risk: CheckStatus;
    };
    freeze_authority: {
      status: CheckStatus;
      authority: string | null;
      risk: CheckStatus;
    };
    supply: {
      total: number;
      decimals: number;
    };
    top_holders: {
      status: CheckStatus;
      top_10_percentage: number;
      top_1_percentage: number;
      holder_count_estimate: number;
      top_holders_detail: TopHolder[];
      risk: CheckStatus;
    } | null;
    liquidity: {
      status: CheckStatus;
      has_liquidity: boolean;
      primary_pool: string | null;
      pool_address: string | null;
      price_impact_pct: number | null;
      liquidity_rating: LiquidityRating;
      lp_locked: boolean | null;
      lp_lock_percentage: number | null;
      lp_lock_expiry: string | null;
      risk: CheckStatus;
    } | null;
    metadata: {
      status: CheckStatus;
      update_authority: string | null;
      mutable: boolean;
      has_uri: boolean;
      uri: string | null;
      risk: CheckStatus;
    } | null;
    honeypot: {
      status: CheckStatus;
      can_sell: boolean;
      sell_tax_bps: number | null;
      risk: CheckStatus;
    } | null;
    token_age_hours: number | null;
    is_token_2022: boolean;
    token_2022_extensions: Token2022Extension[];
  };
}

// ---------------------------------------------------------------------------
// API client functions
// ---------------------------------------------------------------------------

/** Fetches a free lite scan from the TokenSafe API directly. */
export async function fetchLiteScan(mint: string): Promise<LiteScanResult> {
  const url = `${TOKENSAFE_URL}/v1/check/lite?mint=${mint}`;
  const res = await fetch(url);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<LiteScanResult>;
}

/** Fetches a full report for free (launch period — no auth). */
export async function fetchFullReportFree(
  mint: string,
): Promise<FullCheckResult> {
  const res = await fetch(`/api/full-check-free?mint=${mint}`);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<FullCheckResult>;
}

/** Fetches a full paid report from the Scry backend proxy. */
export async function fetchFullReport(
  mint: string,
  accessToken: string,
): Promise<FullCheckResult> {
  const res = await fetch("/api/full-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mint, access_token: accessToken }),
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return res.json() as Promise<FullCheckResult>;
}
