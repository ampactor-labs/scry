import type { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory IP rate limiter using a sliding window.
 * Not distributed — fine for single-instance Railway deployment.
 */
export function createRateLimiter(maxPerMinute: number) {
  const hits = new Map<string, number[]>();

  // Clean up old entries every 5 minutes
  setInterval(() => {
    const cutoff = Date.now() - 60_000;
    for (const [ip, timestamps] of hits) {
      const filtered = timestamps.filter((t) => t > cutoff);
      if (filtered.length === 0) hits.delete(ip);
      else hits.set(ip, filtered);
    }
  }, 300_000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const cutoff = now - 60_000;

    const timestamps = hits.get(ip) ?? [];
    const recent = timestamps.filter((t) => t > cutoff);

    if (recent.length >= maxPerMinute) {
      res.status(429).json({
        error: "Rate limited. Try again in a moment.",
      });
      return;
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}
