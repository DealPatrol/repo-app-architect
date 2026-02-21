"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StatsBar } from "./components/StatsBar";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { PremiumFooter } from "./components/PremiumFooter";
import { Accordion } from "./components/Accordion";
import { Toast } from "./components/Toast";
import type { RepoAnalysis } from "./api/analyze-repo/route";
import type { DiscoveredProject } from "./api/discover-projects/route";
import type { ReusableFile } from "./api/find-files-for-project/route";

type Mode = "single" | "discover" | "findFiles";

const HISTORY_KEY = "repo-architect-history";
const MAX_HISTORY = 10;

type HistoryEntry =
  | { type: "analysis"; repo: string; data: RepoAnalysis }
  | { type: "discover"; data: DiscoveredProject[]; count: number }
  | { type: "findFiles"; description: string; data: ReusableFile[] };

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] hover:bg-white/10 text-[var(--text-muted)] border border-[var(--border)] transition-colors"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: "success" | "warning" | "info" }) {
  const classes =
    variant === "success"
      ? "bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/40"
      : variant === "warning"
        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
        : "bg-blue-500/20 text-blue-400 border-blue-500/40";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium border ${classes}`}>
      {children}
    </span>
  );
}

function getCompletenessBadge(note: string, missingCount: number) {
  if (missingCount === 0) return <Badge variant="success">Quick win</Badge>;
  if (missingCount <= 3) return <Badge variant="warning">Nearly ready</Badge>;
  return <Badge variant="info">Possible project</Badge>;
}

function CopyToRepoButton({ files, projectName }: { files: string[]; projectName: string }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    const name = prompt("New repo name:", projectName.replace(/\s+/g, "-").toLowerCase().slice(0, 50));
    if (!name?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/copy-to-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRepoName: name.trim(), files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Copy failed");
      window.open(data.url, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Copy failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 transition-colors"
    >
      {loading ? "Copying…" : "Copy to new repo"}
    </button>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<Mode>("single");
  const [owner, setOwner] = useState("vercel");
  const [repo, setRepo] = useState("next.js");
  const [loading, setLoading] = useState(false);
  const [discoverProgress, setDiscoverProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null);
  const [repoName, setRepoName] = useState("");
  const [projects, setProjects] = useState<DiscoveredProject[] | null>(null);
  const [reusableFiles, setReusableFiles] = useState<ReusableFile[] | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [findFilesOptions, setFindFilesOptions] = useState({
    limit: 25,
    excludeForks: true,
    excludeArchived: true,
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [discoverOptions, setDiscoverOptions] = useState({
    limit: 25,
    projectCount: 5,
    excludeForks: true,
    excludeArchived: true,
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const saveToHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev.filter((e) => JSON.stringify(e) !== JSON.stringify(entry))].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore quota
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryEntry[];
        setHistory(Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : []);
      }
    } catch {
      // ignore
    }
  }, []);

  const setModeAndClear = (m: Mode) => {
    setMode(m);
    setError(null);
    setAnalysis(null);
    setProjects(null);
    setReusableFiles(null);
  };

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setProjects(null);
    try {
      const res = await fetch("/api/analyze-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setAnalysis(data);
      setRepoName(`${owner}/${repo}`);
      saveToHistory({ type: "analysis", repo: `${owner}/${repo}`, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleFindFiles() {
    if (!projectDescription.trim()) {
      setError("Describe what you're building");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setProjects(null);
    setReusableFiles(null);
    setDiscoverProgress("Fetching your repos…");
    try {
      const res = await fetch("/api/find-files-for-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: projectDescription.trim(),
          ...findFilesOptions,
        }),
      });
      setDiscoverProgress("Finding reusable files…");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Find files failed");
      const list = data.reusableFiles ?? [];
      setReusableFiles(list);
      saveToHistory({ type: "findFiles", description: projectDescription.trim(), data: list });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setDiscoverProgress(null);
    }
  }

  async function handleDiscover() {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setProjects(null);
    setReusableFiles(null);
    setDiscoverProgress("Fetching your repos…");
    try {
      const res = await fetch("/api/discover-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discoverOptions),
      });
      setDiscoverProgress("Analyzing with AI…");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discovery failed");
      const list = data.potentialProjects ?? [];
      setProjects(list);
      saveToHistory({ type: "discover", data: list, count: list.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setDiscoverProgress(null);
    }
  }

  async function handleExportPDF(type: "full" | "summary" | "capabilities" | "appConcepts") {
    if (!analysis) return;
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: analysis, repoName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blueprint-${type}-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "PDF exported successfully", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Export failed", type: "error" });
    }
  }

  async function handleShare(title: string, type: string, data: object) {
    try {
      const res = await fetch("/api/share-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Share failed");
      navigator.clipboard.writeText(result.url);
      setToast({ message: "Link copied to clipboard!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Share failed", type: "error" });
    }
  }

  async function handleExportFindFilesPDF() {
    if (!reusableFiles || reusableFiles.length === 0) return;
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "findFiles",
          reusableFiles,
          findFilesTitle: projectDescription || "Your project",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reusable-files-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "PDF exported successfully", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Export failed", type: "error" });
    }
  }

  async function handleExportDiscoverPDF() {
    if (!projects || projects.length === 0) return;
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "discovered", projects }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `discovered-projects-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "PDF exported successfully", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Export failed", type: "error" });
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    if (entry.type === "analysis") {
      const [o, r] = entry.repo.split("/");
      setOwner(o || "");
      setRepo(r || "");
      setAnalysis(entry.data);
      setRepoName(entry.repo);
      setProjects(null);
      setReusableFiles(null);
      setMode("single");
    } else if (entry.type === "findFiles") {
      setProjectDescription(entry.description);
      setReusableFiles(entry.data);
      setProjects(null);
      setAnalysis(null);
      setMode("findFiles");
    } else {
      setProjects(entry.data);
      setAnalysis(null);
      setReusableFiles(null);
      setMode("discover");
    }
    setError(null);
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  }

  const techStack = analysis && "techStack" in analysis ? (analysis.techStack as string[]) : [];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar mode={mode} onModeChange={setModeAndClear} />

      <Hero />
      <StatsBar />

      <section id="tools" className="relative py-20">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6">
          {history.length > 0 && (
            <div className="mb-8 p-5 rounded-[var(--radius-lg)] gradient-border">
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Recent activity</h3>
              <div className="flex flex-wrap gap-2">
                {history.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => loadFromHistory(entry)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-colors truncate max-w-[220px]"
                  >
                    {entry.type === "analysis"
                      ? entry.repo
                      : entry.type === "findFiles"
                        ? `Find files: ${entry.description.slice(0, 18)}...`
                        : `Discover (${entry.count} projects)`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] w-fit mb-8">
            {(["single", "discover", "findFiles"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModeAndClear(m)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-[var(--accent)] text-white shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5"
                }`}
              >
                {m === "single" ? "Repo Analysis" : m === "discover" ? "Discover Projects" : "Find Reusable Files"}
              </button>
            ))}
          </div>

          {mode === "single" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. vercel"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Repository</label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="e.g. next.js"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shine"
              >
                {loading ? "Analyzing…" : "Analyze Repository"}
              </button>
            </div>
          )}

          {mode === "discover" && (
            <div className="space-y-6">
              <p className="text-[var(--text-muted)]">
                Scans your repos and suggests applications you could build by combining files. Includes ideas that are a few files short—with exact files needed.
              </p>
              <Accordion title="Discovery options" defaultOpen>
                <div className="flex flex-wrap gap-6 pt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={discoverOptions.limit}
                      onChange={(e) =>
                        setDiscoverOptions((o) => ({ ...o, limit: Math.min(60, Math.max(5, parseInt(e.target.value) || 10)) }))
                      }
                      className="w-16 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] text-sm"
                    />
                    <span className="text-[var(--text-muted)]">Repos to scan</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={discoverOptions.projectCount}
                      onChange={(e) =>
                        setDiscoverOptions((o) => ({
                          ...o,
                          projectCount: Math.min(30, Math.max(1, parseInt(e.target.value) || 5)),
                        }))
                      }
                      className="w-16 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] text-sm"
                    />
                    <span className="text-[var(--text-muted)]">Projects to show</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={discoverOptions.excludeForks}
                      onChange={(e) => setDiscoverOptions((o) => ({ ...o, excludeForks: e.target.checked }))}
                      className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Exclude forks
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={discoverOptions.excludeArchived}
                      onChange={(e) => setDiscoverOptions((o) => ({ ...o, excludeArchived: e.target.checked }))}
                      className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Exclude archived
                  </label>
                </div>
              </Accordion>
              <button
                onClick={handleDiscover}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shine flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {discoverProgress || "Scanning…"}
                  </>
                ) : (
                  "Discover projects"
                )}
              </button>
            </div>
          )}

          {mode === "findFiles" && (
            <div className="space-y-6">
              <p className="text-[var(--text-muted)]">Describe what you&apos;re building. We&apos;ll scan your repos and list files you can reuse.</p>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="e.g. A Next.js dashboard with auth, charts, and a PostgreSQL backend"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-y transition-all"
              />
              <Accordion title="Search options" defaultOpen>
                <div className="flex flex-wrap gap-6 pt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={findFilesOptions.limit}
                      onChange={(e) =>
                        setFindFilesOptions((o) => ({
                          ...o,
                          limit: Math.min(60, Math.max(5, parseInt(e.target.value) || 10)),
                        }))
                      }
                      className="w-16 px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text)] text-sm"
                    />
                    <span className="text-[var(--text-muted)]">Repos to scan</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={findFilesOptions.excludeForks}
                      onChange={(e) => setFindFilesOptions((o) => ({ ...o, excludeForks: e.target.checked }))}
                      className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Exclude forks
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <input
                      type="checkbox"
                      checked={findFilesOptions.excludeArchived}
                      onChange={(e) => setFindFilesOptions((o) => ({ ...o, excludeArchived: e.target.checked }))}
                      className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    Exclude archived
                  </label>
                </div>
              </Accordion>
              <button
                onClick={handleFindFiles}
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shine flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {discoverProgress || "Scanning…"}
                  </>
                ) : (
                  "Find reusable files"
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>
          )}

          {analysis && mode === "single" && (
            <div className="mt-12 space-y-8">
              {techStack.length > 0 && (
                <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-lg font-semibold mb-4">Tech stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] text-sm font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <h2 className="text-lg font-semibold">Repo summary</h2>
                  <div className="flex gap-2">
                    <CopyButton text={analysis.summary} label="Copy" />
                    <button onClick={() => handleShare(`${repoName} – Blueprint`, "analysis", analysis)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                      Share
                    </button>
                    <button onClick={() => handleExportPDF("summary")} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                      Export PDF
                    </button>
                  </div>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
              </section>

              <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <h2 className="text-lg font-semibold">Capabilities</h2>
                  <div className="flex gap-2">
                    <CopyButton text={analysis.capabilities.join("\n")} label="Copy list" />
                    <button onClick={() => handleExportPDF("capabilities")} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                      Export PDF
                    </button>
                  </div>
                </div>
                <ul className="space-y-2">
                  {analysis.capabilities.map((c, i) => (
                    <li key={i} className="text-[var(--text-muted)] flex gap-2">
                      <span className="text-[var(--accent)]">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                  <h2 className="text-lg font-semibold">App concepts</h2>
                  <div className="flex gap-2">
                    <CopyButton text={analysis.appConcepts.join("\n")} label="Copy list" />
                    <button onClick={() => handleExportPDF("appConcepts")} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                      Export PDF
                    </button>
                  </div>
                </div>
                <ul className="space-y-2">
                  {analysis.appConcepts.map((c, i) => (
                    <li key={i} className="text-[var(--text-muted)] flex gap-2">
                      <span className="text-[var(--accent)]">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </section>

              {"suggestedImprovements" in analysis && Array.isArray(analysis.suggestedImprovements) && analysis.suggestedImprovements.length > 0 && (
                <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-lg font-semibold mb-4">Suggested improvements</h2>
                  <ul className="space-y-2">
                    {analysis.suggestedImprovements.map((s, i) => (
                      <li key={i} className="text-[var(--text-muted)] flex gap-2">
                        <span className="text-amber-400">→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => handleExportPDF("full")}
                  className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold transition-all shine"
                >
                  Export full PDF blueprint
                </button>
              </div>
            </div>
          )}

          {projects && mode === "discover" && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Potential projects from your repos</h2>
                <div className="flex gap-2">
                  <button onClick={() => handleShare("Discovered projects", "discover", projects)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
                    Share
                  </button>
                  <button onClick={handleExportDiscoverPDF} className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors">
                    Export all to PDF
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                {projects.map((p, i) => (
                  <section key={i} className="rounded-[var(--radius-lg)] gradient-border p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--accent)]">{p.name}</h3>
                      {getCompletenessBadge(p.completenessNote, p.missingFiles.length)}
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{p.description}</p>
                    <p className="text-amber-400/90 text-sm font-medium mb-3">{p.completenessNote}</p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                          <h4 className="font-medium text-[var(--text-muted)]">Existing files</h4>
                          <div className="flex gap-2">
                            <CopyButton text={p.existingFiles.join("\n")} label="Copy" />
                            {p.existingFiles.length > 0 && <CopyToRepoButton files={p.existingFiles} projectName={p.name} />}
                          </div>
                        </div>
                        <ul className="space-y-1 text-[var(--text-muted)]">
                          {p.existingFiles.length > 0 ? (
                            p.existingFiles.map((f, j) => (
                              <li key={j} className="font-mono text-xs truncate" title={f}>
                                <span className="text-[var(--accent)]">✓</span> {f}
                              </li>
                            ))
                          ) : (
                            <li className="text-[var(--text-subtle)]">None identified</li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-[var(--text-muted)]">Files needed</h4>
                          <CopyButton text={p.missingFiles.join("\n")} label="Copy" />
                        </div>
                        <ul className="space-y-1 text-[var(--text-muted)]">
                          {p.missingFiles.length > 0 ? (
                            p.missingFiles.map((f, j) => (
                              <li key={j} className="font-mono text-xs truncate" title={f}>
                                <span className="text-amber-400">+</span> {f}
                              </li>
                            ))
                          ) : (
                            <li className="text-[var(--accent)]">Ready to build</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}

          {reusableFiles && mode === "findFiles" && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Reusable files for: &quot;{projectDescription}&quot;</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleShare(`Files for: ${projectDescription}`, "findFiles", { reusableFiles })}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={handleExportFindFilesPDF}
                    className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
                  >
                    Export PDF
                  </button>
                  <CopyToRepoButton files={reusableFiles.map((f) => f.path)} projectName={projectDescription.slice(0, 30) || "new-project"} />
                  <CopyButton text={reusableFiles.map((f) => `${f.path}\n  ${f.reason}`).join("\n\n")} label="Copy all" />
                </div>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
                {reusableFiles.map((f, i) => (
                  <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] transition-colors">
                    <div className="min-w-0 flex-1">
                      <code className="text-sm font-mono text-[var(--accent)] break-all">{f.path}</code>
                      <p className="text-[var(--text-muted)] text-sm mt-1">{f.reason}</p>
                    </div>
                    <CopyButton text={f.path} label="Copy path" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <FeatureShowcase />
      <PremiumFooter />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
