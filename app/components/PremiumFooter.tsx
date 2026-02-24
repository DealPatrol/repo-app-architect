"use client";

import Link from "next/link";

const GITHUB_REPO = "https://github.com/DealPatrol/repo-app-architect";

type ToolMode = "single" | "discover" | "findFiles";

const productLinks: { label: string; mode: ToolMode }[] = [
  { label: "Repo Analysis", mode: "single" },
  { label: "Discover Projects", mode: "discover" },
  { label: "Find Reusable Files", mode: "findFiles" },
];

const resourceLinks = [
  { label: "Documentation", href: `${GITHUB_REPO}#readme` },
  { label: "Deployment Checklist", href: `${GITHUB_REPO}/blob/main/DEPLOYMENT_CHECKLIST.md` },
  { label: "Changelog", href: `${GITHUB_REPO}/releases` },
];

const companyLinks: { label: string; href: string; external?: boolean }[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "mailto:colecollins763@gmail.com", external: true },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function PremiumFooter({ onNavigateToTool }: { onNavigateToTool?: (mode: ToolMode) => void }) {
  const handleProductClick = (mode: ToolMode) => {
    onNavigateToTool?.(mode);
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[var(--border)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link href="/" className="text-xl font-bold gradient-text hover:opacity-90">
              Repo Architect
            </Link>
            <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xs">
              AI-powered GitHub intelligence. Analyze repos, discover projects, find reusable files, and export PDF blueprints.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => handleProductClick(l.mode)}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-left"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleProductClick("single")}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-left"
                >
                  Export PDF
                </button>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-subtle)]">
            © {new Date().getFullYear()} Repo Architect. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-subtle)] hover:text-[var(--accent)] transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
