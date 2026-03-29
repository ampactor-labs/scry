import { config } from "./config.js";
import { createApp, finalizeApp } from "./app.js";
import { initDb, getDb } from "./db.js";
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

  // Finalize routes (static files, SPA fallback, 404, error handler)
  // Must come AFTER bot webhook is mounted
  finalizeApp(app);

  // Start server
  const server = app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      `Scry server listening on port ${config.PORT}`,
    );
  });

  // Graceful shutdown — Railway sends SIGTERM before killing
  function shutdown(signal: string) {
    logger.info({ signal }, "Shutting down gracefully");
    server.close(() => {
      try {
        getDb().close();
      } catch {
        // DB may not be initialized
      }
      logger.info("Server closed");
      process.exit(0);
    });
    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10_000);
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  logger.error(err, "Fatal startup error");
  process.exit(1);
});
