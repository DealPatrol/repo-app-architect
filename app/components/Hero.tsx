"use client";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-3xl" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4 animate-fade-in">
          AI-Powered GitHub Intelligence
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text)] leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Turn your repos into
          <br />
          <span className="gradient-text">actionable blueprints</span>
        </h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Analyze architecture, discover projects you can build from existing code, and find reusable files across your entire GitHub portfolio.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/30">
            Deep architecture insights
          </span>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-muted)] border border-[var(--border)]">
            Cross-repo project discovery
          </span>
          <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-muted)] border border-[var(--border)]">
            One-click copy to new repo
          </span>
        </div>
      </div>
    </section>
  );
}
