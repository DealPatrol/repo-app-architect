"use client";

export function StatsBar() {
  const stats = [
    { value: "10M+", label: "Repos analyzed" },
    { value: "50K+", label: "Projects discovered" },
    { value: "99.9%", label: "Uptime" },
  ];
  return (
    <section className="py-12 border-y border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-[var(--text-subtle)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
