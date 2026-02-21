"use client";

export function FeatureShowcase() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Repo Analysis",
      desc: "Architecture, dependencies, tech stack, and improvement suggestions in seconds.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
      title: "Discover Projects",
      desc: "AI identifies apps you can build by combining files across your repos.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      title: "Find Reusable Files",
      desc: "Describe your project. Get a curated list of files to reuse from your codebase.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
      title: "Export & Share",
      desc: "PDF blueprints, shareable links, and one-click copy to new GitHub repo.",
    },
  ];
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-[var(--text)] mb-4">
          Built for serious developers
        </h2>
        <p className="text-center text-[var(--text-muted)] max-w-2xl mx-auto mb-16">
          Enterprise-grade GitHub intelligence. Ship faster by knowing exactly what you have and what you can build.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors shine"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[var(--text)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
