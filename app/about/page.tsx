import Link from "next/link";

export const metadata = {
  title: "About – Repo Architect",
  description: "AI-powered GitHub repository analysis and code intelligence",
};

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold mb-6">About Repo Architect</h1>
        <p className="text-[var(--text-muted)] leading-relaxed mb-6">
          Repo Architect is an AI-powered tool that helps developers get more from their GitHub repositories.
        </p>
        <h2 className="text-xl font-semibold mb-3">What it does</h2>
        <ul className="text-[var(--text-muted)] space-y-2 mb-8">
          <li>• <strong>Repo Analysis</strong> – Deep dive into any repository: tech stack, architecture, dependencies, and suggested improvements</li>
          <li>• <strong>Discover Projects</strong> – Scans your repos and suggests applications you can build by combining existing files</li>
          <li>• <strong>Find Reusable Files</strong> – Describe what you&apos;re building; get a curated list of files to reuse</li>
          <li>• <strong>Export & Share</strong> – PDF blueprints, shareable links, and one-click copy to new GitHub repos</li>
        </ul>
        <p className="text-[var(--text-muted)] text-sm">
          Built for developers who want to ship faster by knowing exactly what they have and what they can build.
        </p>
      </main>
    </div>
  );
}
