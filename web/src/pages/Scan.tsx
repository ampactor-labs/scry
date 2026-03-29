import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useLiteScan } from "../hooks/useLiteScan";
import { LiteReport } from "../components/LiteReport";
import { FullReport } from "../components/FullReport";
import { PaymentModal } from "../components/PaymentModal";
import { fetchFullReport, type FullCheckResult } from "../lib/api";
import { saveRecentScan } from "./Home";

/** Main scan/report page — driven by :mint URL param. */
export function Scan() {
  const { mint = "" } = useParams<{ mint: string }>();

  const {
    data: liteData,
    loading: liteLoading,
    error: liteError,
    scan,
  } = useLiteScan();

  const [fullData, setFullData] = useState<FullCheckResult | null>(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminKey = searchParams.get("admin");

  // Kick off lite scan on mount / when mint changes
  useEffect(() => {
    if (mint) scan(mint);
    setFullData(null);
    setFullError(null);
    setShowPayment(false);

    if (adminKey && mint) {
      handlePaymentComplete(adminKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint, adminKey]);

  // Save recent scan when lite data arrives
  useEffect(() => {
    if (!liteData) return;
    saveRecentScan({
      mint: liteData.mint,
      name: liteData.name,
      symbol: liteData.symbol,
      risk_score: liteData.risk_score,
      risk_level: liteData.risk_level,
    });
  }, [liteData]);

  // Load full report after payment completes
  function handlePaymentComplete(accessToken: string) {
    setShowPayment(false);
    setFullLoading(true);
    setFullError(null);

    fetchFullReport(mint, accessToken)
      .then((data) => setFullData(data))
      .catch((err) =>
        setFullError(
          err instanceof Error ? err.message : "Failed to load full report",
        ),
      )
      .finally(() => setFullLoading(false));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Scan another */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
        >
          <span>←</span> Scan another token
        </Link>
      </div>

      {/* Loading state */}
      {liteLoading && (
        <div className="flex flex-col items-center gap-4 py-20 animate-fade-in">
          <LoadingSpinner />
          <p className="text-muted text-sm">Scanning token…</p>
        </div>
      )}

      {/* Error state */}
      {!liteLoading && liteError && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-center animate-fade-in">
          <p className="text-danger font-semibold mb-1">Scan failed</p>
          <p className="text-muted text-sm">{liteError}</p>
        </div>
      )}

      {/* Report — full if purchased, lite + paywall otherwise */}
      {!liteLoading && !liteError && liteData && (
        <>
          {fullData ? (
            <FullReport data={fullData} />
          ) : (
            <>
              <LiteReport
                data={liteData}
                onGetFullReport={() => setShowPayment(true)}
              />

              {/* Full report loading after payment */}
              {fullLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
                  <LoadingSpinner small />
                  Loading detailed analysis…
                </div>
              )}

              {/* Full report fetch error */}
              {fullError && (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
                  <p className="text-danger text-sm">{fullError}</p>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="mt-2 text-accent text-sm hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          mint={mint}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

function LoadingSpinner({ small }: { small?: boolean }) {
  const size = small ? "h-4 w-4" : "h-8 w-8";
  return (
    <svg
      className={`animate-spin ${size} text-accent`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
