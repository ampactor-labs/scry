import { Router } from "express";
import { verifyAccessToken } from "../lib/access-token.js";
import { fetchFullCheck } from "../lib/tokensafe.js";
import { logger } from "../lib/logger.js";
import { createRateLimiter } from "../lib/rate-limit.js";

export const scanRouter = Router();

const freeCheckLimiter = createRateLimiter(20); // 20 full checks/min per IP

/**
 * GET /api/full-check-free
 *
 * Free full report — rate limited, no auth. For launch period only.
 * When paywall is re-enabled, remove this route.
 */
scanRouter.get("/full-check-free", freeCheckLimiter, async (req, res) => {
  const mint = req.query.mint as string | undefined;

  if (!mint || mint.length < 32 || mint.length > 44) {
    res.status(400).json({ error: "Invalid mint address" });
    return;
  }

  const data = await fetchFullCheck(mint);
  logger.info({ mint }, "full-check-free served");
  res.json(data);
});

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
