"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

const TOOLS = [
  { id: "single", label: "Repo Analysis", desc: "Deep dive into any repository", href: "#" },
  { id: "discover", label: "Discover Projects", desc: "Find apps you can build from your code", href: "#" },
  { id: "findFiles", label: "Find Reusable Files", desc: "Match your project to existing files", href: "#" },
  { id: "compare", label: "Compare Repos", desc: "Side-by-side comparison of two repositories", href: "#" },
];

export function Navbar({
  mode,
  onModeChange,
}: {
  mode: string;
  onModeChange: (m: "single" | "discover" | "findFiles" | "compare") => void;
}) {
  const { data: session, status } = useSession();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-tight gradient-text">Repo Architect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {/* Tools dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors"
              >
                Tools
                <svg className="w-4 h-4 transition-transform" style={{ transform: toolsOpen ? "rotate(180deg)" : "none" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {toolsOpen && (
                <div
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                  className="absolute top-full left-0 mt-1 w-72 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl animate-fade-in"
                >
                  {TOOLS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onModeChange(t.id as "single" | "discover" | "findFiles" | "compare");
                        setToolsOpen(false);
                        document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${mode === t.id ? "bg-[var(--accent-muted)] text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
                    >
                      <div className="font-medium text-[var(--text)]">{t.label}</div>
                      <div className="text-xs text-[var(--text-subtle)] mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="#features" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors">
              Features
            </Link>
            <Link href="/docs" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors">
              API
            </Link>
            <Link href="/pricing" className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--gradient-end)] flex items-center justify-center text-xs font-bold text-white">
                    {(session.user?.email?.[0] || session.user?.name?.[0] || "?").toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-[var(--text-muted)] max-w-[120px] truncate">
                    {session.user?.email || session.user?.name}
                  </span>
                  <svg className="w-4 h-4 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 mt-1 w-56 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl z-20 animate-fade-in">
                      <div className="px-4 py-2 border-b border-[var(--border)]">
                        <p className="text-sm font-medium truncate">{session.user?.name}</p>
                        <p className="text-xs text-[var(--text-subtle)] truncate">{session.user?.email}</p>
                      </div>
                      <button
                        onClick={() => { signOut(); setAccountOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[var(--bg)] font-medium hover:bg-[var(--text-muted)] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
