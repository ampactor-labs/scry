# Scry

Solana token safety scanner — beautiful web UI + Telegram bot wrapping the [tokensafe](../tokensafe) API.

## Throughline

- **Upstream**: tokensafe (the engine — on-chain safety analysis API)
- **Related**: bounty-hunter (security patterns), flowpilot (Solana trading)

## Quick Start

```bash
npm install
npm run dev        # Runs web (Vite :5173) + server (Express :3000) concurrently
npm run build      # Builds web/dist + server/dist
npm start          # Starts server (serves frontend + API + bot)
```

## Architecture

Single Railway service serving everything:
- **web/** — React 18 + Vite + Tailwind CSS v4 frontend
- **server/** — Express 5 backend (API routes + static file serving + Grammy Telegram bot)
- **Payment**: Solana wallet adapter → USDC transfer → on-chain verification via Helius → HMAC access token
- **DB**: SQLite (one payments table for anti-replay)

## Key Files

| File | Purpose |
|------|---------|
| `web/src/pages/Scan.tsx` | Main report page (lite + full report flow) |
| `web/src/components/RiskDial.tsx` | Animated SVG risk score gauge (hero visual) |
| `web/src/components/PaymentModal.tsx` | Wallet adapter USDC payment flow |
| `web/src/lib/api.ts` | API types + fetch functions (tokensafe + backend) |
| `server/src/app.ts` | Express app factory (routes + static + SPA fallback) |
| `server/src/lib/verify-tx.ts` | On-chain USDC payment verification (Helius RPC) |
| `server/src/lib/access-token.ts` | HMAC-SHA256 stateless access tokens |
| `server/src/routes/payment.ts` | POST /api/verify-payment (anti-replay + verify + token) |
| `server/src/routes/scan.ts` | POST /api/full-check (token auth + tokensafe proxy) |
| `server/src/bot/bot.ts` | Grammy Telegram bot (webhook mode) |
| `server/src/db.ts` | SQLite init + payment CRUD |
| `server/src/config.ts` | Zod-validated environment config |

## Doc-to-Code Mapping

| Source File(s) | Documentation Target(s) | What to Update |
|---|---|---|
| `web/src/lib/api.ts` | CLAUDE.md (Architecture) | API types, endpoints |
| `server/src/config.ts` | `.env.example`, CLAUDE.md (Deploy) | Config options |
| `server/src/routes/*.ts` | CLAUDE.md (Key Files) | Route changes |
| Any new component | CLAUDE.md (Key Files) | Component purpose |

## Deploy

Single Railway service from repo root. Requires:
- Railway volume mounted at `/data` for persistent SQLite
- All env vars from `.env.example` set in Railway dashboard

**Critical**: Railway's filesystem is ephemeral. Without a volume, the payments DB (replay protection) resets on every deploy.

## Security Notes

- Payment verification: blockTime check (5min max age) + USDC delta + anti-replay via UNIQUE constraint
- Access tokens: HMAC-SHA256, mint-bound, 1hr TTL, constant-time verification
- Telegram webhook: authenticated via secret token header
- CORS: restricted to SERVER_URL in production
