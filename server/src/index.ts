import { config } from "./config.js";
import { createApp } from "./app.js";
import { initDb } from "./db.js";
import { logger } from "./lib/logger.js";
import { setupBot } from "./bot/bot.js";

async function main() {
  // Initialize database
  initDb(config.DATABASE_PATH);
  logger.info("Database initialized");

  // Create Express app
  const app = createApp();

  // Set up Telegram bot if token is configured
  if (config.TELEGRAM_BOT_TOKEN) {
    await setupBot(app, config.TELEGRAM_BOT_TOKEN, config.SERVER_URL);
    logger.info("Telegram bot webhook registered");
  } else {
    logger.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
  }

  // Start server
  app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      `Scry server listening on port ${config.PORT}`,
    );
  });
}

main().catch((err) => {
  logger.error(err, "Fatal startup error");
  process.exit(1);
});
