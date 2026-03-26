import { Router } from "express";

export const healthRouter = Router();

const startTime = Date.now();

/**
 * GET /health
 *
 * Lightweight health check used by Railway's healthcheck probe and uptime
 * monitors. Returns 200 with server uptime in seconds.
 */
healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});
