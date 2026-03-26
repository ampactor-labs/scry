import { createHmac } from "node:crypto";
import { config } from "../config.js";

const TTL_SECONDS = 3600;

/**
 * Signs a stateless access token bound to a specific mint address.
 * Token format: `${mint}.${expiresAt}.${hmac}`
 * where expiresAt is Unix epoch seconds and hmac is HMAC-SHA256 of
 * `${mint}.${expiresAt}` with ACCESS_TOKEN_SECRET.
 */
export function signAccessToken(mint: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${mint}.${expiresAt}`;
  const hmac = createHmac("sha256", config.ACCESS_TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return `${payload}.${hmac}`;
}

/**
 * Verifies an access token against the expected mint address.
 * Returns true only if the hmac is valid, the mint matches, and the token
 * has not expired.
 */
export function verifyAccessToken(
  token: string,
  expectedMint: string,
): boolean {
  // Format: <mint>.<expiresAt>.<hmac>
  // The mint itself may contain dots (base58 doesn't, but be safe — split from right).
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const secondLastDot = token.lastIndexOf(".", lastDot - 1);
  if (secondLastDot === -1) return false;

  const mint = token.slice(0, secondLastDot);
  const expiresAtStr = token.slice(secondLastDot + 1, lastDot);
  const receivedHmac = token.slice(lastDot + 1);

  if (mint !== expectedMint) return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (now > expiresAt) return false;

  const payload = `${mint}.${expiresAtStr}`;
  const expectedHmac = createHmac("sha256", config.ACCESS_TOKEN_SECRET)
    .update(payload)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (receivedHmac.length !== expectedHmac.length) return false;

  let diff = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    diff |= receivedHmac.charCodeAt(i) ^ expectedHmac.charCodeAt(i);
  }
  return diff === 0;
}
