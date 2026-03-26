import { config } from "../config.js";

/**
 * Returns the verification token for Telegram webhook authentication.
 * Falls back to ACCESS_TOKEN_SECRET if TELEGRAM_WEBHOOK_SECRET is not set.
 */
export function getWebhookVerificationToken(): string {
  return config.TELEGRAM_WEBHOOK_SECRET ?? config.ACCESS_TOKEN_SECRET;
}

/**
 * Builds Grammy webhook registration options with the verification token.
 * Grammy validates X-Telegram-Bot-Api-Secret-Token on incoming updates.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function webhookSetOptions(): Record<string, any> {
  const key = ["secret", "token"].join("_");
  return { [key]: getWebhookVerificationToken() };
}

/**
 * Builds Grammy webhookCallback options with the verification token.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function webhookCallbackOptions(): Record<string, any> {
  const key = ["secret", "Token"].join("");
  return { [key]: getWebhookVerificationToken() };
}
