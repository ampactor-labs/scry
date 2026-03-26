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
    icon: "⛓",
    title: "On-Chain Data",
    desc: "Every check reads directly from Solana RPC and Helius. No stale caches — results are live.",
  },
  {
    icon: "🍯",
    title: "Honeypot Detection",
    desc: "Simulates a sell transaction to verify you can actually exit your position.",
  },
  {
    icon: "🔒",
    title: "LP Lock Analysis",
    desc: "Checks whether liquidity is locked, for how long, and what percentage remains.",
  },
];

/** Landing page. */
export function Home() {
  const recent = loadRecent().slice(0, MAX_RECENT);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-text leading-tight">
          See through any <span className="text-accent">Solana token.</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Free instant analysis. Full reports for $1.50 USDC.
        </p>
        <AddressInput />
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
                        {entry.name}
                      </span>
                      <span className="text-muted text-xs">{entry.symbol}</span>
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
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-surface p-5 space-y-2"
          >
            <div className="text-2xl">{f.icon}</div>
            <h3 className="text-text font-semibold text-sm">{f.title}</h3>
            <p className="text-muted text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
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
