"use client";

import { useState } from "react";

type FileDeps = { path: string; imports: string[]; resolvedPaths: string[] };

export function DependencyViewer({ files }: { files: string[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ files: FileDeps[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/file-dependencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (files.length === 0) return null;

  return (
    <>
      <button
        onClick={load}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--border)] transition-colors disabled:opacity-50"
      >
        {loading ? "Loading…" : "Show dependencies"}
      </button>

      {open && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="max-w-lg w-full max-h-[80vh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File dependencies</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)]">
                ×
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              {data.files.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <code className="text-sm font-mono text-[var(--accent)] break-all">{f.path}</code>
                  {f.imports.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
                      {f.imports.map((imp, j) => (
                        <li key={j} className="font-mono text-xs">
                          → {imp}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--text-subtle)]">No local imports</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
