import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-accent">scry</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <a
            href="https://tokensafe-production.up.railway.app/health"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text transition-colors"
          >
            API Status
          </a>
        </nav>
      </div>
    </header>
  );
}
