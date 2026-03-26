import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const USDC_MINT = import.meta.env.VITE_USDC_MINT as string;
const TREASURY = import.meta.env.VITE_TREASURY_WALLET as string;
// Convert dollar amount to USDC micro-units (6 decimals)
const PAYMENT_DOLLARS = Number(import.meta.env.VITE_PAYMENT_AMOUNT ?? "1.5");
const PAYMENT_AMOUNT = BigInt(Math.round(PAYMENT_DOLLARS * 1_000_000));

interface PaymentModalProps {
  mint: string;
  onPaymentComplete: (accessToken: string) => void;
  onClose: () => void;
}

type Step = "idle" | "building" | "confirm" | "verifying" | "done" | "error";

/** Modal overlay for USDC payment flow. */
export function PaymentModal({
  mint,
  onPaymentComplete,
  onClose,
}: PaymentModalProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handlePay() {
    if (!wallet.publicKey || !wallet.sendTransaction) return;

    setStep("building");
    setErrorMsg(null);

    try {
      const usdcMint = new PublicKey(USDC_MINT);
      const treasury = new PublicKey(TREASURY);

      const [fromAta, toAta] = await Promise.all([
        getAssociatedTokenAddress(usdcMint, wallet.publicKey),
        getAssociatedTokenAddress(usdcMint, treasury),
      ]);

      const ix = createTransferInstruction(
        fromAta,
        toAta,
        wallet.publicKey,
        PAYMENT_AMOUNT,
        [],
        TOKEN_PROGRAM_ID,
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;
      tx.add(ix);

      setStep("confirm");
      const signature = await wallet.sendTransaction(tx, connection);

      // Wait for confirmation (60s timeout to avoid hanging on dropped txs)
      setStep("verifying");
      const confirmPromise = connection.confirmTransaction(
        signature,
        "confirmed",
      );
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Transaction confirmation timed out")),
          60_000,
        ),
      );
      await Promise.race([confirmPromise, timeout]);

      // Verify on backend
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, mint }),
      });

      if (!res.ok) {
        let msg = `Verification failed (HTTP ${res.status})`;
        try {
          const body = await res.json();
          msg = body.message || body.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const { access_token } = (await res.json()) as { access_token: string };
      setStep("done");
      onPaymentComplete(access_token);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Payment failed. Please retry.";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  const isProcessing =
    step === "building" || step === "confirm" || step === "verifying";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-text mb-1">Full Report</h2>
        <p className="text-muted text-sm mb-6">
          Unlock the complete analysis for this token.
        </p>

        {/* Price display */}
        <div className="rounded-lg border border-border bg-bg p-4 flex justify-between items-center mb-6">
          <span className="text-muted text-sm">Full Token Report</span>
          <span className="text-text font-semibold text-lg">$1.50 USDC</span>
        </div>

        {/* What's included */}
        <ul className="space-y-1.5 text-sm text-muted mb-6">
          {[
            "Holder concentration analysis",
            "LP lock details & expiry",
            "Score breakdown by check",
            "Token-2022 extension audit",
            "Risk alerts & factors",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-success">✓</span> {item}
            </li>
          ))}
        </ul>

        {/* Action area */}
        {step === "error" && errorMsg && (
          <div className="mb-4 rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
            {errorMsg}
          </div>
        )}

        {!wallet.connected ? (
          <button
            onClick={() => openWalletModal(true)}
            className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-3 font-medium transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2"
          >
            {step === "building" && (
              <>
                <SpinIcon /> Building transaction…
              </>
            )}
            {step === "confirm" && (
              <>
                <SpinIcon /> Confirm in wallet…
              </>
            )}
            {step === "verifying" && (
              <>
                <SpinIcon /> Verifying payment…
              </>
            )}
            {(step === "idle" || step === "error") && "Pay $1.50 USDC"}
          </button>
        )}

        <p className="text-center text-xs text-muted mt-4">
          Payment is on-chain via USDC. One-time per token.
        </p>
      </div>
    </div>
  );
}

function SpinIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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
