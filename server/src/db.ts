import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { logger } from "./lib/logger.js";

let db: Database.Database | null = null;

/**
 * Initializes the SQLite database at the given path, creating the payments
 * table if it does not already exist. Also ensures the parent directory exists.
 */
export function initDb(dbPath: string): void {
  // Ensure parent directory exists (Railway volumes, local dev)
  if (dbPath !== ":memory:") {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_signature TEXT NOT NULL UNIQUE,
      mint TEXT NOT NULL,
      payer_wallet TEXT NOT NULL,
      amount_lamports INTEGER NOT NULL,
      verified_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  logger.info({ dbPath }, "SQLite database ready");
}

/**
 * Returns the active database instance. Throws if initDb has not been called.
 */
export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized — call initDb first");
  }
  return db;
}

/**
 * Returns true if the given transaction signature has already been recorded,
 * preventing replay of the same payment.
 */
export function isPaymentUsed(txSignature: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM payments WHERE tx_signature = ?")
    .get(txSignature);
  return row !== undefined;
}

/**
 * Atomically records a verified USDC payment. Uses INSERT OR IGNORE to handle
 * the TOCTOU race — if two concurrent requests pass the isPaymentUsed check,
 * only the first INSERT succeeds. Returns true if the payment was recorded,
 * false if it was a duplicate (race loser).
 */
export function recordPayment(
  txSignature: string,
  mint: string,
  payerWallet: string,
  amountLamports: number,
): boolean {
  const result = getDb()
    .prepare(
      `INSERT OR IGNORE INTO payments (tx_signature, mint, payer_wallet, amount_lamports)
       VALUES (?, ?, ?, ?)`,
    )
    .run(txSignature, mint, payerWallet, amountLamports);
  return result.changes > 0;
}
