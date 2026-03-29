import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { paymentRouter } from "./routes/payment.js";
import { scanRouter } from "./routes/scan.js";
import { healthRouter } from "./routes/health.js";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates and configures the Express application.
 * Does not start listening — that is the caller's responsibility.
 */
export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    next();
  });

  // Parse JSON bodies
  app.use(express.json());

  // CORS — restrict to own domain in production, allow all in development
  const corsOrigin = config.NODE_ENV === "production" ? config.SERVER_URL : "*";
  app.use(cors({ origin: corsOrigin }));

  // Attach a unique request ID to every request for log correlation
  app.use((req, _res, next) => {
    (req as express.Request & { id: string }).id = randomUUID();
    next();
  });

  // Request logging
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, "request");
    next();
  });

  // API routes
  app.use("/api", paymentRouter);
  app.use("/api", scanRouter);
  app.use("/", healthRouter);

  return app;
}

/**
 * Registers late-binding routes (bot webhook, static files, SPA fallback,
 * 404 handler, error handler). Call AFTER mounting any dynamic routes like
 * the Telegram bot webhook.
 */
export function finalizeApp(app: express.Express): void {
  const webDist = path.join(__dirname, "../../web/dist");

  // Serve built frontend from web/dist
  app.use(express.static(webDist));

  // SPA fallback — serve index.html for non-API, non-health GET requests
  app.get(/^(?!\/api|\/health).*$/, (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });

  // 404 handler for unmatched /api/* routes
  app.use("/api/*splat", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Global error handler (Express 5 passes async errors here automatically)
  app.use(
    (
      err: unknown,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      logger.error({ err, method: req.method, url: req.url }, message);
      res.status(500).json({ error: "Internal server error" });
    },
  );
}
