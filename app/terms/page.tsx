import Link from "next/link";

export const metadata = {
  title: "Terms of Service – Repo Architect",
  description: "Terms of service for Repo Architect",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="text-[var(--accent)] hover:underline text-sm">
            ← Back to Repo Architect
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-subtle)] mb-8">Last updated: February 2025</p>

        <section className="space-y-6 text-[var(--text-muted)] leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">1. Acceptance</h2>
            <p>By using Repo Architect, you agree to these Terms. If you do not agree, do not use the service.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">2. Use of the Service</h2>
            <p>You may use Repo Architect to analyze repositories you have access to, discover projects, find reusable files, and export blueprints. You are responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Complying with GitHub&apos;s Terms of Service</li>
              <li>Respecting the licenses of repositories you analyze</li>
              <li>Not using the service for unlawful or abusive purposes</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">3. Paid Plans</h2>
            <p>If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law or as stated in the plan. We may change pricing with reasonable notice.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">4. Disclaimer</h2>
            <p>Repo Architect is provided &quot;as is.&quot; We do not warrant accuracy of AI-generated analysis or suggestions. Use at your own risk.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of Repo Architect.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">6. Contact</h2>
            <p>Questions? Email <a href="mailto:colecollins763@gmail.com" className="text-[var(--accent)] hover:underline">colecollins763@gmail.com</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
