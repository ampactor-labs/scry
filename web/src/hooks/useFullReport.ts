import { useState, useEffect } from "react";
import { fetchFullReport, type FullCheckResult } from "../lib/api";

export interface UseFullReportResult {
  data: FullCheckResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook that fetches a full paid report when an accessToken is provided.
 * Does nothing until accessToken is a non-empty string.
 */
export function useFullReport(
  mint: string,
  accessToken: string | null,
): UseFullReportResult {
  const [data, setData] = useState<FullCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetchFullReport(mint, accessToken)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch full report",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mint, accessToken]);

  return { data, loading, error };
}
