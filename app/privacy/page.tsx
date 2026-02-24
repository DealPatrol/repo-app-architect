import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – Repo Architect",
  description: "Privacy policy for Repo Architect",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-subtle)] mb-8">Last updated: February 2025</p>

        <section className="space-y-6 text-[var(--text-muted)] leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">1. Information We Collect</h2>
            <p>When you use Repo Architect, we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account data</strong> – When you sign in with GitHub, we receive your profile (name, email, avatar) and an OAuth access token to read repositories you authorize.</li>
              <li><strong>Usage data</strong> – Repository content is sent to our AI provider (OpenAI) to generate analysis. We do not permanently store your repository contents.</li>
              <li><strong>Shared blueprints</strong> – If you use the Share feature, we store the blueprint data (analysis, project suggestions, or file lists) in Supabase to serve shareable links.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">2. How We Use Your Data</h2>
            <p>We use your data solely to provide Repo Architect: analyzing repos, discovering projects, finding reusable files, generating PDFs, and sharing blueprints. We do not sell or share your data with third parties for marketing.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">3. Third-Party Services</h2>
            <p>We use:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>GitHub</strong> – Authentication and repository access</li>
              <li><strong>OpenAI</strong> – AI processing for analysis and suggestions</li>
              <li><strong>Supabase</strong> – Storing shared blueprints</li>
              <li><strong>Vercel</strong> – Hosting (if applicable)</li>
            </ul>
            <p className="mt-2">Each service has its own privacy policy. Your use of Repo Architect is subject to GitHub&apos;s Terms of Service.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">4. Data Retention</h2>
            <p>We do not retain repository contents after processing. Shared blueprints are stored until you stop sharing or we remove them. Account data is retained while your account is active.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">5. Your Rights</h2>
            <p>You can revoke GitHub access at any time. To delete shared blueprints or request data deletion, contact us at the email below.</p>
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
