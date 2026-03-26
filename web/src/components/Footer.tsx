export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted">
      <p>
        Powered by{" "}
        <a
          href="https://tokensafe-production.up.railway.app/.well-known/x402"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          TokenSafe
        </a>{" "}
        on-chain analysis. Not financial advice.
      </p>
    </footer>
  );
}
