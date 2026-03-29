import { Link } from "react-router-dom";
import { AddressInput } from "../components/AddressInput";
import { RiskBadge } from "../components/RiskBadge";
import type { LiteScanResult } from "../lib/api";
import { truncateAddress } from "../lib/format";

const RECENT_KEY = "scry_recent";
const MAX_RECENT = 5;

type RecentEntry = Pick<
  LiteScanResult,
  "mint" | "name" | "symbol" | "risk_score" | "risk_level"
>;

function loadRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentEntry[];
  } catch {
    return [];
  }
}

const features = [
  {
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
    title: "On-Chain Data",
    desc: "Every check reads directly from Solana. Mint authority, freeze authority, holder analysis — verified on-chain, not cached.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    title: "Honeypot Detection",
    desc: "Simulates a real sell via Jupiter to verify you can exit. Catches honeypots that authority checks alone miss.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: "LP Lock Analysis",
    desc: "Detects locked liquidity across 9+ locker programs. Shows lock percentage, duration, and expiry date.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-accent"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Token-2022 Audit",
    desc: "Deep analysis of Token Extensions. Flags PermanentDelegate, TransferFee, TransferHook — risks most scanners miss.",
  },
];

const steps = [
  { num: "1", label: "Paste address", desc: "Any Solana token mint" },
  {
    num: "2",
    label: "Instant analysis",
    desc: "10+ on-chain checks in seconds",
  },
  {
    num: "3",
    label: "Share results",
    desc: "Warn your friends, save your bags",
  },
];

/** Landing page. */
export function Home() {
  const recent = loadRecent().slice(0, MAX_RECENT);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-text leading-tight">
          See through any <span className="text-accent">Solana token.</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Paste any token mint address. Get an instant rug risk report. On-chain
          analysis, no BS.
        </p>
        <AddressInput />
        <p className="text-xs text-muted">
          Free instant scans. No wallet needed. No signup.
        </p>
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-center text-sm font-semibold text-muted uppercase tracking-wider">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="flex flex-col items-center text-center gap-2 p-4"
            >
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                {s.num}
              </div>
              <p className="text-text font-semibold text-sm">{s.label}</p>
              <p className="text-muted text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent scans */}
      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
            Recent Scans
          </h2>
          <div className="space-y-2">
            {recent.map((entry) => (
              <Link
                key={entry.mint}
                to={`/scan/${entry.mint}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text font-medium group-hover:text-accent transition-colors">
                        {entry.name || "Unknown"}
                      </span>
                      {entry.symbol && (
                        <span className="text-muted text-xs">
                          {entry.symbol}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      {truncateAddress(entry.mint, 6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text font-semibold text-sm">
                    {entry.risk_score}
                  </span>
                  <RiskBadge level={entry.risk_level} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feature grid */}
      <section className="space-y-6">
        <h2 className="text-center text-sm font-semibold text-muted uppercase tracking-wider">
          What Scry checks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-surface p-5 flex gap-4"
            >
              <div className="shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <h3 className="text-text font-semibold text-sm">{f.title}</h3>
                <p className="text-muted text-xs leading-relaxed mt-1">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engine credit */}
      <section className="text-center space-y-2 py-4">
        <p className="text-muted text-sm">
          Powered by{" "}
          <a
            href="https://tokensafe-production.up.railway.app/.well-known/x402"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text font-medium hover:text-accent transition-colors"
          >
            TokenSafe
          </a>{" "}
          — deterministic on-chain analysis via x402 micropayments.
        </p>
        <p className="text-muted text-xs">
          Pure RPC data. No third-party proxies. No opaque ML. Every risk point
          traceable to on-chain state.
        </p>
      </section>
    </div>
  );
}

/** Utility — called by Scan page to persist a result to localStorage. */
export function saveRecentScan(entry: RecentEntry): void {
  try {
    const existing = loadRecent();
    const filtered = existing.filter((e) => e.mint !== entry.mint);
    const updated = [entry, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}
