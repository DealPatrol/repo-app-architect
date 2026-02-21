"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RepoAnalysis } from "@/app/api/analyze-repo/route";
import type { DiscoveredProject } from "@/app/api/discover-projects/route";
import type { ReusableFile } from "@/app/api/find-files-for-project/route";

export default function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<{ title: string; type: string; data: RepoAnalysis | DiscoveredProject[] | { reusableFiles: ReusableFile[] } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/share-blueprint?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not found"))))
      .then(setData)
      .catch(() => setError("Blueprint not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400">{error}</p>
        <Link href="/" className="text-emerald-400 hover:underline">
          ← Back to Repo Architect
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-emerald-400"
          >
            Open in Repo Architect →
          </Link>
        </div>

        {data.type === "analysis" && (
          <div className="space-y-6">
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h2 className="text-lg font-semibold mb-3">Summary</h2>
              <p className="text-zinc-300 whitespace-pre-wrap">
                {(data.data as RepoAnalysis).summary}
              </p>
            </section>
            {"techStack" in data.data && Array.isArray((data.data as RepoAnalysis).techStack) && (
              <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold mb-3">Tech stack</h2>
                <div className="flex flex-wrap gap-2">
                  {(data.data as RepoAnalysis).techStack.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-zinc-800 text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {data.type === "discover" && Array.isArray(data.data) && (
          <div className="space-y-4">
            {(data.data as DiscoveredProject[]).map((p, i) => (
              <section
                key={i}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <h3 className="text-lg font-semibold text-emerald-400">{p.name}</h3>
                <p className="text-zinc-400 text-sm mt-1">{p.description}</p>
              </section>
            ))}
          </div>
        )}

        {data.type === "findFiles" && "reusableFiles" in data.data && (
          <div className="space-y-2">
            {(data.data as { reusableFiles: ReusableFile[] }).reusableFiles.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <code className="text-emerald-400 text-sm">{f.path}</code>
                <p className="text-zinc-500 text-sm mt-1">{f.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
