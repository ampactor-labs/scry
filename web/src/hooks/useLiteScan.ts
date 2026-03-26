import { useState, useCallback } from "react";
import { fetchLiteScan, type LiteScanResult } from "../lib/api";

export interface UseLiteScanResult {
  data: LiteScanResult | null;
  loading: boolean;
  error: string | null;
  scan: (mint: string) => Promise<void>;
}

/** React hook that fetches a lite scan result for a given token mint. */
export function useLiteScan(initialMint?: string): UseLiteScanResult {
  const [data, setData] = useState<LiteScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (mint: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchLiteScan(mint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scan");
    } finally {
      setLoading(false);
    }
  }, []);

  // Kick off a scan immediately if an initial mint was provided.
  // We use a ref to avoid re-running on every render.
  const [didInitialScan, setDidInitialScan] = useState(false);
  if (initialMint && !didInitialScan) {
    setDidInitialScan(true);
    scan(initialMint);
  }

  return { data, loading, error, scan };
}
