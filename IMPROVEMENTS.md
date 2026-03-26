# Scry — Competitive Analysis & Improvement Plan

## Competitive Landscape Summary

| Tool | Monthly Traffic | Pricing | Key Strength | Key Weakness |
|------|----------------|---------|--------------|--------------|
| RugCheck | 276K visits | Free (token-gated unlimited) | Trust + API integrations | No honeypot sim, no bundles, utilitarian UI |
| Birdeye | Massive | Freemium API | Best UI, multi-chain | Security is secondary feature |
| DEXScreener | Massive | Free | #1 discovery surface | No native safety checks |
| SolSniffer | ~70K users | Free + paid API | 20+ indicators, wallet clustering | Low brand recognition |
| GoPlus | 717M API calls/mo | B2B API tiers | Infrastructure dominance | No consumer UI |
| BubbleMaps | Growing | Freemium + token | Best wallet visualization | No risk score, manual interpretation |
| DexTools | Large | Freemium + token | DEXTscore composite | Solana honeypot detection weak |
| Trading bots (Trojan, BonkBot) | 1.7M+ users | 1% tx fee | Speed, integrated trading | Safety checks are basic afterthought |

## Scry's Existing Edges

1. **Token-2022 deep analysis** — PermanentDelegate, TransferFee, TransferHook, DefaultAccountState. Most competitors treat this superficially. Scry parses the full TLV. This is defensible.
2. **Honeypot detection via simulation** — Real Jupiter buy/sell round-trip, not just authority checks.
3. **Beautiful UI** — Dark crypto aesthetic with animated risk dial. Competitors are utilitarian.
4. **USDC micropayments** — No account needed, crypto-native payment. Unique in the space.

## Gaps Nobody Fills Well

1. **Bundle detection** — Coordinated first-buyer detection. Only niche tools (VOLTA, Dragon) do this. No mainstream scanner includes it.
2. **Deployer reputation** — "This deployer rugged 3 previous tokens." On-chain data exists, nobody scores it.
3. **Post-purchase risk monitoring** — "Token you hold just had mint authority re-enabled." Nobody alerts on risk *changes*.
4. **Shareable scan cards** — OG images for Twitter sharing. Free marketing flywheel. Nobody does this well.

---

## Prioritized Improvements

### TONIGHT (Pre-Launch, 1-2 hours)

These are zero-backend changes that make the launch more effective:

1. **"Share on X" button** on scan results
   - Pre-populated tweet: "I just checked $[SYMBOL] with @ScryApp — Risk: [SCORE]/100 ([LEVEL]). Check yours: [URL]"
   - Zero code on backend. Frontend-only. Drives organic sharing.

2. **Token-2022 extension explainer tooltips**
   - When Token-2022 extensions are detected, show plain English: "PermanentDelegate: The token creator can drain your wallet at any time."
   - Already have the data in the full report. Just need human-readable descriptions.

3. **Recent rugs showcase on landing page**
   - Pre-scan 3-5 known recent rug pulls. Show their scores on the homepage.
   - "Scry caught these rugs before they happened" — retroactive proof.

### THIS WEEK (Quick Wins, hours not days)

4. **Shareable OG image cards** (Vercel Edge or server-side)
   - `/scan/:mint` generates a dynamic OG image: risk score dial, token name, key flags
   - When shared on Twitter/Telegram, shows a rich preview card
   - Implementation: Canvas API or SVG→PNG on the server, served at `/api/og/:mint`

5. **Deployer history link**
   - Show deployer wallet address in scan results
   - Link to their previous token deployments (Solscan/Helius data)
   - Even without scoring, "deployer created 14 previous tokens, 12 are dead" is powerful

6. **"Watch this token" via Telegram bot**
   - `/watch <address>` — monitor for risk score changes
   - Uses tokensafe's existing webhook/delta detection infrastructure
   - Killer retention feature — users come back because alerts bring them back

7. **Referral system**
   - Generate `/r/<code>` links, track attribution via localStorage
   - 25% revenue share on referred paid features for 12 months
   - CT influencers shill tools when economics work. GMGN's #1 growth driver.

8. **Free public API (rate-limited)**
   - `GET /api/v1/check?mint=<ADDR>` — returns lite scan JSON
   - Rate limit: 10 req/min per IP
   - This IS the RugCheck playbook. Other tools integrate your API = distribution without marketing.

### LATER (Moat-Building, days-weeks)

9. **Bundle detection**
   - Detect coordinated first-buyers (same-slot buys, common funding wallets)
   - "15% of supply was bundled by 3 coordinated wallets" — nobody shows this in a scanner
   - Requires on-chain analysis of early transaction patterns

10. **Portfolio wallet scan**
    - Enter wallet address → safety report for every token held
    - "Your wallet risk score: 73/100 — 3 tokens are critical risk"
    - Viral: users share their wallet risk scores

11. **Deployer reputation database**
    - Score deployers based on history: # tokens deployed, # that rugged, # with renounced authority
    - First-class risk factor in scan results
    - Builds a moat over time — the database is the product

12. **Real-time risk alerts subscription ($9-15/mo)**
    - "Token you hold had mint authority re-enabled"
    - "LP unlock detected on watched token"
    - Push via Telegram bot + email
    - This is the subscription revenue trigger

13. **Browser extension**
    - Overlay Scry risk scores on DEXScreener, Birdeye, Jupiter pages
    - Shows risk badge next to every token address
    - Distribution where decisions happen

14. **Mobile PWA optimization**
    - Full offline-capable PWA with add-to-homescreen
    - Degens trade on mobile. Scanner mobile UX is universally bad.

---

## Monetization Strategy

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Free** | $0 | Unlimited lite scans, Telegram bot basic, shareable reports |
| **Full Report** | $1.50 USDC | Deep analysis per token (existing) |
| **Pro** | $9-15/mo | Real-time alerts, portfolio scan, deployer history, 100 full reports/mo |
| **API** | $29-99/mo | Developer access, batch queries, webhooks |
| **Referral** | 25% rev share | 12 months per referred paid user |

**Do NOT**: Charge per basic scan, require token holding, remove free tier.

**Key insight**: RugCheck is free. You can't out-free RugCheck. But you CAN out-feature it (Token-2022, honeypot sim, bundle detection) and out-UX it (beautiful reports, shareable cards, mobile). Charge for premium features, not basic access.

---

## Distribution Plan (Tonight)

### Priority 1: Crypto Twitter thread (9-11pm ET)
Hook: "I scanned 50 pump.fun tokens. 38 had mint authority enabled." + thread with screenshots, GIF demo, link.

### Priority 2: Telegram groups (after CT thread is live)
Post in: MemeCoin Daily (1M+), Pump Fun Chat, MemeCoin Whale Pumps (151K). One post each, not spam.

### Priority 3: Reddit r/solana
Data-first post: "Built a tool, here's what I found scanning pump.fun tokens." Link at bottom.

### Priority 4: DM 5-10 nano-influencers
Solana CT accounts with 2K-20K followers. Offer early access for honest review.

---

## Growth Loops

1. **Share loop**: Scan → share button → tweet with preview card → friends click → scan
2. **Alert loop**: Scan → watch → alert when risk changes → return to check → watch more
3. **API loop**: Free API → devs integrate → their users see "Powered by Scry" → organic
4. **Content loop**: "Worst Rugs of the Week" weekly post → proves value → drives traffic
