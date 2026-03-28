export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8 space-y-2 text-center">
      <p className="text-sm text-muted">
        Powered by{" "}
        <a
          href="https://tokensafe-production.up.railway.app/.well-known/x402"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          TokenSafe
        </a>{" "}
        on-chain analysis engine.
      </p>
      <p className="text-xs text-muted/60">
        Scry provides informational data only. This is not financial advice.
        Always do your own research before trading.
      </p>
    </footer>
  );
}
