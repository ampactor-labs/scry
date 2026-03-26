import { config } from "../config.js";
import { logger } from "./logger.js";

/** Maximum age of a valid payment transaction (5 minutes). */
const MAX_TX_AGE_SECONDS = 300;

interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  uiTokenAmount: {
    amount: string;
    decimals: number;
  };
}

interface HeliusGetTransactionResult {
  blockTime: number | null;
  meta: {
    err: unknown;
    preTokenBalances: TokenBalance[];
    postTokenBalances: TokenBalance[];
  };
  transaction: {
    message: {
      accountKeys: Array<{
        pubkey: string;
        signer: boolean;
        writable: boolean;
      }>;
    };
  };
}

/**
 * Verifies that a Solana transaction transferred the correct USDC amount to
 * the treasury wallet using Helius JSON-RPC.
 *
 * Security checks:
 * - Transaction succeeded on-chain
 * - Transaction is recent (within MAX_TX_AGE_SECONDS)
 * - Treasury USDC balance increased by >= expected amount
 * - Uses "confirmed" commitment level
 *
 * Returns `{ valid: true, payer }` on success or `{ valid: false, error }` on
 * any verification failure. Does not throw — all errors are captured in the
 * return value.
 */
export async function verifyUsdcPayment(
  txSignature: string,
  _expectedMint: string, // audit log only — not verified on-chain
): Promise<{
  valid: boolean;
  payer: string;
  amountLamports?: number;
  error?: string;
}> {
  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${config.HELIUS_API_KEY}`;

  let result: HeliusGetTransactionResult;
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          txSignature,
          {
            encoding: "jsonParsed",
            maxSupportedTransactionVersion: 0,
            commitment: "confirmed",
          },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return {
        valid: false,
        payer: "",
        error: `Helius RPC error: ${res.status}`,
      };
    }

    const json = (await res.json()) as {
      result?: HeliusGetTransactionResult;
      error?: { message: string };
    };

    if (json.error) {
      return {
        valid: false,
        payer: "",
        error: `RPC error: ${json.error.message}`,
      };
    }

    if (!json.result) {
      return { valid: false, payer: "", error: "Transaction not found" };
    }

    result = json.result;
  } catch (err) {
    logger.warn({ err, txSignature }, "verifyUsdcPayment: fetch failed");
    return { valid: false, payer: "", error: "Failed to fetch transaction" };
  }

  // Transaction must have succeeded on-chain
  if (result.meta.err !== null) {
    return { valid: false, payer: "", error: "Transaction failed on-chain" };
  }

  // Transaction must be recent — prevents replay of old treasury deposits
  if (result.blockTime !== null) {
    const txAge = Math.floor(Date.now() / 1000) - result.blockTime;
    if (txAge > MAX_TX_AGE_SECONDS) {
      return {
        valid: false,
        payer: "",
        error: `Transaction too old (${txAge}s > ${MAX_TX_AGE_SECONDS}s limit)`,
      };
    }
    if (txAge < -60) {
      // Clock skew guard — tx appears to be in the future
      return {
        valid: false,
        payer: "",
        error: "Transaction timestamp invalid",
      };
    }
  }

  // Extract payer — first account key that is a signer
  const accountKeys = result.transaction.message.accountKeys;
  const payerKey = accountKeys.find((k) => k.signer);
  const payer = payerKey?.pubkey ?? accountKeys[0]?.pubkey ?? "";

  // Expected USDC lamports (USDC has 6 decimals)
  const expectedLamports = Math.floor(config.PAYMENT_AMOUNT_USDC * 1_000_000);

  // Find treasury's USDC token account in post balances
  const postBalance = result.meta.postTokenBalances.find(
    (b) => b.mint === config.USDC_MINT && b.owner === config.TREASURY_WALLET,
  );

  if (!postBalance) {
    logger.debug(
      { _expectedMint, postTokenBalances: result.meta.postTokenBalances },
      "verifyUsdcPayment: no treasury USDC entry in postTokenBalances",
    );
    return {
      valid: false,
      payer,
      error: "No USDC credit to treasury wallet found in transaction",
    };
  }

  // Find corresponding pre-balance (may be missing if account was created)
  const preBalance = result.meta.preTokenBalances.find(
    (b) => b.mint === config.USDC_MINT && b.owner === config.TREASURY_WALLET,
  );

  const postAmount = parseInt(postBalance.uiTokenAmount.amount, 10);
  const preAmount = preBalance
    ? parseInt(preBalance.uiTokenAmount.amount, 10)
    : 0;
  const delta = postAmount - preAmount;

  if (delta < expectedLamports) {
    return {
      valid: false,
      payer,
      error: `Insufficient payment: got ${delta} lamports, need ${expectedLamports}`,
    };
  }

  logger.info(
    { txSignature, payer, delta, _expectedMint },
    "verifyUsdcPayment: payment verified",
  );

  return { valid: true, payer, amountLamports: delta };
}
