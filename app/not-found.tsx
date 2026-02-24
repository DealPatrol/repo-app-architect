import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Page not found</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
      >
        Back to Repo Architect
      </Link>
    </div>
  );
}
