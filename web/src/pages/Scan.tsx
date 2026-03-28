import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLiteScan } from "../hooks/useLiteScan";
import { useFullReport } from "../hooks/useFullReport";
import { LiteReport } from "../components/LiteReport";
import { FullReport } from "../components/FullReport";
import { PaymentModal } from "../components/PaymentModal";
import { saveRecentScan } from "./Home";

const SESSION_KEY = (mint: string) => `scry_token_${mint}`;

/** Main scan/report page — driven by :mint URL param. */
export function Scan() {
  const { mint = "" } = useParams<{ mint: string }>();
  const [showPayment, setShowPayment] = useState(false);

  // Restore access token from session storage (survives page refresh)
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY(mint));
    } catch {
      return null;
    }
  });

  const {
    data: liteData,
    loading: liteLoading,
    error: liteError,
    scan,
  } = useLiteScan();
  const {
    data: fullData,
    loading: fullLoading,
    error: fullError,
  } = useFullReport(mint, accessToken);

  // Kick off lite scan on mount / when mint changes
  useEffect(() => {
    if (mint) scan(mint);
    // Reset payment state if navigating to a new mint
    setShowPayment(false);
    const stored = (() => {
      try {
        return sessionStorage.getItem(SESSION_KEY(mint));
      } catch {
        return null;
      }
    })();
    setAccessToken(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint]);

  // Persist to recent scans once lite data arrives
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

  function handlePaymentComplete(token: string) {
    try {
      sessionStorage.setItem(SESSION_KEY(mint), token);
    } catch {
      // ignore
    }
    setAccessToken(token);
    setShowPayment(false);
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

      {/* Full report (paid) — shown when accessToken is present */}
      {!liteLoading && !liteError && liteData && accessToken && (
        <>
          {fullLoading && (
            <div className="flex flex-col items-center gap-4 py-10">
              <LoadingSpinner />
              <p className="text-muted text-sm">Loading full report…</p>
            </div>
          )}
          {fullError && (
            <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              Failed to load full report: {fullError}. Showing lite report
              instead.
            </div>
          )}
          {fullData && !fullLoading && <FullReport data={fullData} />}
          {/* Fallback to lite while full is loading or errored */}
          {!fullData && !fullLoading && (
            <LiteReport
              data={liteData}
              onGetFullReport={() => setShowPayment(true)}
            />
          )}
        </>
      )}

      {/* Lite report — shown when no access token yet */}
      {!liteLoading && !liteError && liteData && !accessToken && (
        <LiteReport
          data={liteData}
          onGetFullReport={() => setShowPayment(true)}
        />
      )}

      {/* Payment modal */}
      {showPayment && liteData && (
        <PaymentModal
          mint={mint}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-accent"
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
