import { Router } from "express";
import { verifyAccessToken } from "../lib/access-token.js";
import { fetchFullCheck } from "../lib/tokensafe.js";
import { logger } from "../lib/logger.js";
import { config } from "../config.js";

export const scanRouter = Router();

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

  let authValid = false;
  if (config.ADMIN_BYPASS_KEY && access_token === config.ADMIN_BYPASS_KEY) {
    authValid = true;
  } else {
    authValid = verifyAccessToken(access_token, mint);
  }

  if (!authValid) {
    res.status(401).json({ error: "Invalid or expired access token" });
    return;
  }

  const data = await fetchFullCheck(mint);

  logger.info({ mint }, "full-check served");

  res.json(data);
});
