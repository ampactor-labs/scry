import { config } from "../config.js";
import { logger } from "./logger.js";

const TIMEOUT_MS = 25_000;

/**
 * Fetches a lite (unauthenticated) safety check for the given token mint.
 * Returns the parsed JSON response from the tokensafe API.
 * Throws with the error body on non-200 responses.
 */
export async function fetchLiteCheck(mint: string): Promise<unknown> {
  const url = `${config.TOKENSAFE_URL}/v1/check/lite?mint=${encodeURIComponent(mint)}`;
  logger.debug({ mint, url }, "fetchLiteCheck");

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tokensafe lite check failed (${res.status}): ${body}`);
  }
  return res.json();
}

/**
 * Fetches a full authenticated safety check for the given token mint.
 * Requires TOKENSAFE_API_KEY to be set in config for API key auth.
 * Without it, the request hits the x402 paywall and will fail with 402.
 * Returns the parsed JSON response from the tokensafe API.
 */
export async function fetchFullCheck(mint: string): Promise<unknown> {
  if (!config.TOKENSAFE_API_KEY) {
    throw new Error(
      "TOKENSAFE_API_KEY is not configured — cannot proxy full checks",
    );
  }

  const url = `${config.TOKENSAFE_URL}/v1/check?mint=${encodeURIComponent(mint)}`;
  logger.debug({ mint, url }, "fetchFullCheck");

  const res = await fetch(url, {
    headers: { "X-API-Key": config.TOKENSAFE_API_KEY },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tokensafe full check failed (${res.status}): ${body}`);
  }
  return res.json();
}
