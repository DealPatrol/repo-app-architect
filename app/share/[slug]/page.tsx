"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RepoAnalysis } from "@/app/api/analyze-repo/route";

function CopyShareLinkButton() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-elevated)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--border)] transition-colors"
    >
      {copied ? "Copied!" : "Copy share link"}
    </button>
  );
}
import type { DiscoveredProject } from "@/app/api/discover-projects/route";
import type { FindFilesDirection, ReusableFile } from "@/app/api/find-files-for-project/route";
import { FeedbackThumbs } from "@/app/components/FeedbackThumbs";

export default function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<{
    title: string;
    type: string;
    data: RepoAnalysis | DiscoveredProject[] | { reusableFiles: ReusableFile[] } | { directions: FindFilesDirection[] };
  } | null>(null);
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
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <span className="text-[var(--text-muted)]">Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400">{error}</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">
          ← Back to Repo Architect
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <div className="flex items-center gap-2">
            <CopyShareLinkButton />
            <Link
              href="/"
              className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              Open in Repo Architect →
            </Link>
          </div>
        </div>

        {data.type === "analysis" && (
          <div className="space-y-6">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <h2 className="text-lg font-semibold mb-3">Summary</h2>
              <p className="text-[var(--text-muted)] whitespace-pre-wrap">
                {(data.data as RepoAnalysis).summary}
              </p>
            </section>
            {"techStack" in data.data && Array.isArray((data.data as RepoAnalysis).techStack) && (
              <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h2 className="text-lg font-semibold mb-3">Tech stack</h2>
                <div className="flex flex-wrap gap-2">
                  {(data.data as RepoAnalysis).techStack.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-[var(--bg-elevated)] text-sm">
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
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
              >
                <h3 className="text-lg font-semibold text-[var(--accent)]">{p.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">{p.description}</p>
              </section>
            ))}
          </div>
        )}

        {data.type === "findFiles" && "directions" in data.data && (
          <div className="space-y-4">
            {(data.data as { directions: FindFilesDirection[] }).directions.map((dir, i) => (
              <section key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <h3 className="text-lg font-semibold text-[var(--accent)]">{dir.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">{dir.shortDescription}</p>
                <p className="text-[var(--text-subtle)] text-sm mt-2">{dir.fullDescription}</p>
              </section>
            ))}
          </div>
        )}
        {data.type === "findFiles" && "reusableFiles" in data.data && (
          <div className="space-y-2">
            {(data.data as { reusableFiles: ReusableFile[] }).reusableFiles.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                <code className="text-[var(--accent)] text-sm">{f.path}</code>
                <p className="text-[var(--text-subtle)] text-sm mt-1">{f.reason}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <FeedbackThumbs target={slug || ""} feedbackType={data.type} />
        </div>
      </div>
    </div>
  );
}
