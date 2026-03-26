/**
 * Plain-English explanations of Token-2022 extension types.
 * Keyed by the extension type string from tokensafe's API.
 */
export const extensionExplainers: Record<string, string> = {
  PERMANENT_DELEGATE:
    "The token creator can transfer or burn tokens from ANY holder's wallet at any time. This is the most dangerous extension — your tokens can be drained without your approval.",
  TRANSFER_FEE:
    "A fee is automatically deducted on every transfer. The fee rate can be changed by the authority. Check the current rate — high or hidden fees eat your profits.",
  TRANSFER_HOOK:
    "A custom program runs on every transfer. This can be used to block sells, blacklist wallets, or add hidden logic. Extremely risky if the program is unverified.",
  DEFAULT_ACCOUNT_STATE:
    "New token accounts are frozen by default. You cannot transfer tokens until the authority unfreezes your account. Can be used to selectively block sellers.",
  CONFIDENTIAL_TRANSFERS:
    "Transfer amounts are encrypted and hidden from public view. While this has legitimate privacy uses, on memecoins it can hide insider accumulation and dumping.",
  NON_TRANSFERABLE:
    "Tokens cannot be transferred between wallets. This is normal for soulbound tokens but suspicious for tradeable assets.",
  INTEREST_BEARING:
    "Token balances accrue interest over time. The rate is set by the authority and can change. Verify the rate and who controls it.",
  MEMO_REQUIRED:
    "All transfers must include a memo. Low risk — usually for compliance or record-keeping.",
  IMMUTABLE_OWNER:
    "Token account ownership cannot be reassigned. This is a safety feature — generally positive.",
  CPI_GUARD:
    "Restricts certain cross-program invocations on token accounts. This is a safety feature — generally positive.",
  CLOSE_AUTHORITY:
    "An authority can close token accounts and reclaim the rent. Low risk for most tokens.",
  METADATA_POINTER:
    "Token metadata is stored on-chain via Token-2022 instead of Metaplex. Neutral — just a different metadata standard.",
  GROUP_POINTER:
    "Token is part of a token group. Neutral — used for organizing related tokens.",
  GROUP_MEMBER_POINTER:
    "Token is a member of a token group. Neutral — used for organizing related tokens.",
};

/** Returns the explainer for an extension type, or null if unknown. */
export function getExtensionExplainer(type: string): string | null {
  return extensionExplainers[type] ?? null;
}
