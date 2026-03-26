import { Router } from "express";
import { isPaymentUsed, recordPayment } from "../db.js";
import { verifyUsdcPayment } from "../lib/verify-tx.js";
import { signAccessToken } from "../lib/access-token.js";
import { logger } from "../lib/logger.js";

export const paymentRouter = Router();

/**
 * POST /api/verify-payment
 *
 * Verifies a Solana USDC payment on-chain and issues a single-use access token
 * for the full token safety report.
 *
 * Request body: { signature: string, mint: string }
 * Response 200: { access_token: string, expires_in: 3600 }
 * Response 400: { error: string }
 * Response 409: { error: string }  — signature already used
 */
paymentRouter.post("/verify-payment", async (req, res) => {
  const { signature, mint } = req.body as Record<string, unknown>;

  if (
    typeof signature !== "string" ||
    typeof mint !== "string" ||
    mint.length < 32 ||
    mint.length > 44
  ) {
    res.status(400).json({
      error:
        "Invalid request body. Provide signature (string) and mint (32-44 chars).",
    });
    return;
  }

  // Anti-replay: fast check before expensive on-chain verification
  if (isPaymentUsed(signature)) {
    res.status(409).json({ error: "Transaction already used" });
    return;
  }

  const result = await verifyUsdcPayment(signature, mint);

  if (!result.valid) {
    logger.warn(
      { signature, mint, error: result.error },
      "Payment verification failed",
    );
    res
      .status(400)
      .json({ error: result.error ?? "Payment verification failed" });
    return;
  }

  // Atomic insert — handles TOCTOU race (two requests verifying the same tx)
  const recorded = recordPayment(
    signature,
    mint,
    result.payer,
    result.amountLamports ?? 0,
  );
  if (!recorded) {
    res.status(409).json({ error: "Transaction already used" });
    return;
  }

  const accessToken = signAccessToken(mint);

  logger.info(
    { signature, mint, payer: result.payer },
    "Payment verified, access token issued",
  );

  res.json({ access_token: accessToken, expires_in: 3600 });
});
