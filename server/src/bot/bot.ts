import { Bot, webhookCallback } from "grammy";
import type express from "express";
import { fetchLiteCheck } from "../lib/tokensafe.js";
import { formatLiteReport, type LiteCheckResponse } from "./format.js";
import { logger } from "../lib/logger.js";
import {
  webhookSetOptions,
  webhookCallbackOptions,
} from "../lib/webhook-auth.js";

/** Loose base58 pattern covering Solana addresses (32-44 chars). */
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function isValidSolanaAddress(text: string): boolean {
  return SOLANA_ADDRESS_RE.test(text.trim());
}

async function runScan(mint: string): Promise<string> {
  const data = await fetchLiteCheck(mint);
  return formatLiteReport(data as LiteCheckResponse);
}

/**
 * Sets up the Grammy Telegram bot in webhook mode and mounts it on the given
 * Express app at /api/telegram-webhook.
 */
export async function setupBot(
  app: express.Express,
  token: string,
  serverUrl: string,
): Promise<void> {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Welcome to Scry! Paste any Solana token address to check its safety.\n\n" +
        "Commands:\n" +
        "/scan <address> — Free safety scan\n" +
        "/full <address> — Get the full detailed report",
    );
  });

  bot.command("scan", async (ctx) => {
    const args = ctx.match.trim();
    if (!args || !isValidSolanaAddress(args)) {
      await ctx.reply(
        "Please provide a valid Solana token address.\n\nExample: /scan EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      );
      return;
    }
    const mint = args.trim();
    await ctx.reply("Scanning token... please wait.", {
      parse_mode: undefined,
    });
    try {
      const report = await runScan(mint);
      await ctx.reply(report, { parse_mode: "MarkdownV2" });
    } catch (err) {
      logger.warn({ err, mint }, "bot /scan error");
      await ctx.reply(
        "Sorry, I couldn't fetch the safety report right now. Please try again in a moment.",
      );
    }
  });

  bot.command("full", async (ctx) => {
    const args = ctx.match.trim();
    if (!args || !isValidSolanaAddress(args)) {
      await ctx.reply(
        "Please provide a valid Solana token address.\n\nExample: /full EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      );
      return;
    }
    const mint = args.trim();
    await ctx.reply(
      `Full reports are available on the web!\n\n🔗 scry.app/scan/${mint}`,
    );
  });

  // Treat any plain-text message that looks like a Solana address as an implicit /scan
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    if (!isValidSolanaAddress(text)) {
      return; // Not an address — ignore
    }
    await ctx.reply("Scanning token... please wait.");
    try {
      const report = await runScan(text);
      await ctx.reply(report, { parse_mode: "MarkdownV2" });
    } catch (err) {
      logger.warn({ err, mint: text }, "bot address scan error");
      await ctx.reply(
        "Sorry, I couldn't fetch the safety report right now. Please try again in a moment.",
      );
    }
  });

  // Register webhook with Telegram — authenticate incoming updates
  const webhookUrl = `${serverUrl}/api/telegram-webhook`;
  await bot.api.setWebhook(webhookUrl, webhookSetOptions());
  logger.info({ webhookUrl }, "Telegram webhook registered");

  // Mount webhook handler with authentication
  app.use(
    "/api/telegram-webhook",
    webhookCallback(bot, "express", webhookCallbackOptions()),
  );
}
