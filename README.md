# Scry

Solana token safety scanner. Beautiful web UI + Telegram bot powered by [TokenSafe](https://github.com/ampactor-labs/tokensafe).

Paste any token mint address — get an instant risk report with honeypot simulation, authority checks, Token-2022 extension analysis, liquidity assessment, and holder concentration.

**Free. No account needed.**

## Use It

**Web:** [scry.app](https://scry.app)

**Telegram:** [@ScryTokenBot](https://t.me/ScryTokenBot) — just paste a Solana address

## What You Get

- Risk score 0–100 with color-coded severity
- Honeypot detection via real Jupiter buy/sell roundtrip
- Mint/freeze authority status
- Token-2022 extension analysis (PermanentDelegate, TransferFee, TransferHook)
- Liquidity rating and LP lock status
- Top holder concentration
- Token age

Every data point is traceable to on-chain state. No opaque ML, no third-party security APIs.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Backend:** Express 5 (API proxy + static serving + Telegram webhook)
- **Engine:** [TokenSafe](https://github.com/ampactor-labs/tokensafe) API
- **Bot:** Grammy (Telegram)
- **Payments:** Solana wallet adapter → USDC → on-chain verification via Helius

## Self-Hosting

```bash
git clone https://github.com/ampactor-labs/scry
cd scry
cp .env.example .env
# Set required env vars (see .env.example)
npm install
npm run dev
```

Requires Node 22+ and a running [TokenSafe](https://github.com/ampactor-labs/tokensafe) instance (or use the public API).

## License

MIT
