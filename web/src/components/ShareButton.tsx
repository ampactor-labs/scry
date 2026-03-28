interface ShareButtonProps {
  mint: string;
  name: string | null;
  symbol: string | null;
  score: number;
  level: string;
}

/** "Share on X" button that opens a pre-populated tweet. */
export function ShareButton({
  mint,
  name,
  symbol,
  score,
  level,
}: ShareButtonProps) {
  const label =
    name && symbol ? `$${symbol} (${name})` : mint.slice(0, 8) + "...";
  const url = `${window.location.origin}/scan/${mint}`;

  const text = [
    `I just checked ${label} with @ScryApp`,
    `Risk: ${score}/100 (${level})`,
    `Check any Solana token before you ape:`,
    url,
  ].join("\n");

  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 hover:border-accent/60 transition-colors"
    >
      <XLogo />
      Share Scan
    </a>
  );
}

function XLogo() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
