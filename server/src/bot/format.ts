/** Shape of the tokensafe lite check response (matches actual API fields). */
export interface LiteCheckResponse {
  mint: string;
  name: string | null;
  symbol: string | null;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  summary: string;
  authorities_renounced: boolean;
  has_liquidity: boolean;
  can_sell: boolean | null;
  is_token_2022: boolean;
  has_risky_extensions: boolean;
  token_age_hours: number | null;
  liquidity_rating: string | null;
  top_10_concentration: number | null;
}

/**
 * Escapes all MarkdownV2 special characters so they are rendered as literals
 * in Telegram messages.
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, "\\$&");
}

/**
 * Formats a tokensafe lite check response as a Telegram MarkdownV2 message.
 */
export function formatLiteReport(
  data: LiteCheckResponse,
  baseUrl?: string,
): string {
  const {
    mint,
    name,
    symbol,
    risk_score,
    risk_level,
    summary,
    authorities_renounced,
    has_liquidity,
    can_sell,
    token_age_hours,
    top_10_concentration,
  } = data;

  const riskEmoji =
    risk_score <= 30
      ? "🟢"
      : risk_score <= 60
        ? "🟡"
        : risk_score <= 80
          ? "🟠"
          : "🔴";

  const scoreLabel = escapeMarkdownV2(`${risk_score}/100`);
  const riskLevelEsc = escapeMarkdownV2(risk_level);

  const tokenLabel = name
    ? `*${escapeMarkdownV2(name)}* ${symbol ? escapeMarkdownV2(symbol) : ""}`
    : "";

  const authLine = authorities_renounced
    ? "✅ Authorities renounced"
    : "❌ Authorities NOT renounced";

  const liquidityLine = has_liquidity ? "✅ Has liquidity" : "❌ No liquidity";
  const sellLine =
    can_sell === null
      ? "⚠️ Sell check unavailable"
      : can_sell
        ? "✅ Can sell"
        : "❌ Cannot sell";

  const ageLine =
    token_age_hours !== null
      ? `⏰ Age: ${escapeMarkdownV2(formatAge(token_age_hours))}`
      : "";

  const holderLine =
    top_10_concentration !== null
      ? `📊 Top 10 holders: ${escapeMarkdownV2(top_10_concentration.toFixed(1))}%`
      : "";

  const summaryLine = summary ? `\n_${escapeMarkdownV2(summary)}_\n` : "";

  const mintEsc = escapeMarkdownV2(mint);

  return [
    `🔍 *Token Safety Report*`,
    tokenLabel,
    `\`${mintEsc}\``,
    ``,
    `📊 Risk Score: *${riskEmoji} ${scoreLabel}* \\(${riskLevelEsc}\\)`,
    authLine,
    liquidityLine,
    sellLine,
    ageLine,
    holderLine,
    summaryLine,
    `🔗 Full report: [Open in Scry](${escapeMarkdownV2(baseUrl ?? "https://scry-production.up.railway.app")}/scan/${mint})`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAge(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 720)}mo`;
}
