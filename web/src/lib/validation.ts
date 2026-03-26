const BASE58_CHARS =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Validates a string looks like a Solana base58 address (32-44 chars, valid alphabet). */
export function isValidSolanaAddress(address: string): boolean {
  if (address.length < 32 || address.length > 44) return false;
  for (const char of address) {
    if (!BASE58_CHARS.includes(char)) return false;
  }
  return true;
}
