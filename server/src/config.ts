import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  TOKENSAFE_URL: z
    .string()
    .url()
    .default("https://tokensafe-production.up.railway.app"),
  TOKENSAFE_API_KEY: z.string().optional(),
  TREASURY_WALLET: z.string().min(32).max(44),
  HELIUS_API_KEY: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  SERVER_URL: z.string().url().default("http://localhost:3000"),
  ACCESS_TOKEN_SECRET: z.string().min(16),
  DATABASE_PATH: z.string().default("./data/scry.db"),
  USDC_MINT: z.string().default("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  PAYMENT_AMOUNT_USDC: z.coerce.number().default(0.10),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment configuration:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const config = loadConfig();
export type Config = z.infer<typeof envSchema>;

/** Token used to verify Telegram webhook authenticity. */
export function getTelegramWebhookToken(): string {
  return config.TELEGRAM_WEBHOOK_SECRET ?? config.ACCESS_TOKEN_SECRET;
}
