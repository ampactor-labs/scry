import { Router } from "express";
import { verifyAccessToken } from "../lib/access-token.js";
import { fetchFullCheck } from "../lib/tokensafe.js";
import { logger } from "../lib/logger.js";

export const scanRouter = Router();

/**
 * POST /api/full-check
 *
 * Returns the full tokensafe safety report for a token mint, authenticated via
 * an access token issued by POST /api/verify-payment.
 *
 * Request body: { mint: string, access_token: string }
 * Response 200: full tokensafe check JSON
 * Response 400: { error: string }
 * Response 401: { error: string }  — missing/invalid/expired token
 */
scanRouter.post("/full-check", async (req, res) => {
  const { mint, access_token } = req.body as Record<string, unknown>;

  if (typeof mint !== "string" || mint.length < 32 || mint.length > 44) {
    res.status(400).json({ error: "Invalid mint address" });
    return;
  }

  if (typeof access_token !== "string" || !access_token) {
    res.status(401).json({ error: "access_token required" });
    return;
  }

  if (!verifyAccessToken(access_token, mint)) {
    res.status(401).json({ error: "Invalid or expired access token" });
    return;
  }

  const data = await fetchFullCheck(mint);

  logger.info({ mint }, "full-check served");

  res.json(data);
});
