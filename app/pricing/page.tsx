import Link from "next/link";

export const metadata = {
  title: "Pricing – Repo Architect",
  description: "Pricing plans for Repo Architect",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-[var(--accent)] hover:underline text-sm">
            ← Back to Repo Architect
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Simple, transparent pricing</h1>
        <p className="text-center text-[var(--text-muted)] mb-16 max-w-xl mx-auto">
          Start free. Upgrade when you need more.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <h2 className="text-xl font-semibold mb-2">Free</h2>
            <p className="text-3xl font-bold text-[var(--accent)] mb-4">$0<span className="text-base font-normal text-[var(--text-muted)]">/month</span></p>
            <ul className="space-y-3 text-[var(--text-muted)] mb-8">
              <li>✓ Repo analysis</li>
              <li>✓ Discover projects (sign in required)</li>
              <li>✓ Find reusable files</li>
              <li>✓ Export PDF blueprints</li>
              <li>✓ Share links</li>
              <li>✓ Copy to new repo</li>
            </ul>
            <Link
              href="/#tools"
              className="block w-full py-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-white/10 text-center font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-card)] p-8 relative">
            <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)] text-white">
              Coming soon
            </span>
            <h2 className="text-xl font-semibold mb-2">Pro</h2>
            <p className="text-3xl font-bold text-[var(--accent)] mb-4">TBD<span className="text-base font-normal text-[var(--text-muted)]">/month</span></p>
            <ul className="space-y-3 text-[var(--text-muted)] mb-8">
              <li>✓ Everything in Free</li>
              <li>✓ Higher usage limits</li>
              <li>✓ Priority support</li>
              <li>✓ Team features</li>
            </ul>
            <a
              href="mailto:colecollins763@gmail.com?subject=Repo%20Architect%20Pro%20interest"
              className="block w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-center font-medium transition-colors"
            >
              Get notified when Pro launches
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--text-subtle)] mt-12">
          Currently in free beta. <a href="mailto:colecollins763@gmail.com" className="text-[var(--accent)] hover:underline">Contact us</a> for custom plans.
        </p>
      </main>
    </div>
  );
}
