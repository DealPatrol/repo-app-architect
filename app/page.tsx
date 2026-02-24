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
import { FeedbackThumbs } from "./components/FeedbackThumbs";
import { CostEstimate } from "./components/CostEstimate";
import { DependencyViewer } from "./components/DependencyViewer";
import type { RepoAnalysis } from "./api/analyze-repo/route";
import type { DiscoveredProject } from "./api/discover-projects/route";
import type { FindFilesDirection, ReusableFile } from "./api/find-files-for-project/route";

type Mode = "single" | "discover" | "findFiles" | "compare";

const HISTORY_KEY = "repo-architect-history";
const FAVORITES_KEY = "repo-architect-favorites";
const MAX_HISTORY = 10;

type HistoryEntry =
  | { type: "analysis"; repo: string; data: RepoAnalysis }
  | { type: "discover"; data: DiscoveredProject[]; count: number }
  | { type: "findFiles"; description: string; data: FindFilesDirection[] };

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

function DirectionCard({
  direction,
  projectDescription,
  onCopyToRepo,
  onGenerateScaffolding,
  CopyToRepoButton,
  CopyButton,
  selected,
  onToggleSelect,
  isFavorite,
  onToggleFavorite,
}: {
  direction: FindFilesDirection;
  projectDescription: string;
  onCopyToRepo: () => void;
  onGenerateScaffolding: () => void;
  CopyToRepoButton: React.ComponentType<{ files: string[]; projectName: string }>;
  CopyButton: React.ComponentType<{ text: string; label: string }>;
  selected?: boolean;
  onToggleSelect?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasExisting = direction.existingFiles.length > 0;
  const hasMissing = direction.missingFiles.length > 0;

  return (
    <section className="rounded-[var(--radius-lg)] gradient-border p-6">
      <div className="flex items-start gap-3">
        {onToggleSelect && (
          <label className="flex items-center pt-0.5 shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={selected ?? false} onChange={onToggleSelect} className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)]" />
          </label>
        )}
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex-1 text-left">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-[var(--accent)]">{direction.name}</h3>
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                  className="p-1 rounded-lg hover:bg-white/5 text-[var(--text-muted)]"
                  title={isFavorite ? "Remove from saved" : "Save direction"}
                >
                  <svg className={`w-5 h-5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              )}
              <svg className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-[var(--text-muted)] text-sm mt-1">{direction.shortDescription}</p>
        </button>
      </div>

      {expanded && (
        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-[var(--text)] mb-2">What this produces</h4>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">{direction.fullDescription}</p>
          </div>

          {hasExisting && (
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 className="text-sm font-medium text-[var(--text-muted)]">Files you have</h4>
                <div className="flex gap-2">
                  <CopyToRepoButton
                    files={direction.existingFiles.map((f) => f.path)}
                    projectName={direction.name.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}
                  />
                  <DependencyViewer files={direction.existingFiles.map((f) => f.path)} />
                </div>
              </div>
              <ul className="space-y-2">
                {direction.existingFiles.map((f, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-[var(--bg-elevated)]">
                    <div className="min-w-0 flex-1">
                      <code className="text-sm font-mono text-[var(--accent)] break-all">{f.path}</code>
                      <p className="text-[var(--text-subtle)] text-xs mt-0.5">{f.reason}</p>
                    </div>
                    <CopyButton text={f.path} label="Copy path" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasMissing && (
            <div>
              <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">Files you need</h4>
              <p className="text-[var(--text-subtle)] text-xs mb-3">
                These files are not in your repos. Generate starter code to scaffold them.
              </p>
              <ul className="space-y-2 mb-4">
                {direction.missingFiles.map((f, i) => (
                  <li key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <code className="text-sm font-mono text-amber-400">{f.path}</code>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">{f.description}</p>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onGenerateScaffolding}
                  className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium border border-amber-500/40 transition-colors"
                >
                  Generate scaffolding
                </button>
                <CostEstimate estimate={0.05} label="per generation" />
              </div>
            </div>
          )}

          {!hasMissing && hasExisting && (
            <p className="text-sm text-[var(--accent)]">Ready to build — copy existing files to a new repo.</p>
          )}
        </div>
      )}
    </section>
  );
}

function CopyToRepoButton({ files, projectName }: { files: string[]; projectName: string }) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<{ path: string; content: string }[] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  async function loadPreview() {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/preview-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreview(data.files ?? []);
    } catch {
      setPreview([]);
    } finally {
      setPreviewLoading(false);
    }
  }

  function openPreview() {
    setShowPreview(true);
    setPreview(null);
    loadPreview();
  }

  async function confirmCopy() {
    const name = prompt("New repo name:", projectName.replace(/\s+/g, "-").toLowerCase().slice(0, 50));
    if (!name?.trim()) return;
    setShowPreview(false);
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
  }

  return (
    <>
      <button
        onClick={openPreview}
        disabled={loading || files.length === 0}
        className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 transition-colors"
      >
        {loading ? "Copying…" : "Copy to new repo"}
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowPreview(false)}>
          <div
            className="max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview before copy</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)]">×</button>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              These {files.length} file{files.length !== 1 ? "s" : ""} will be copied to a new repo.
            </p>
            {previewLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading file contents…</p>
            ) : preview && preview.length > 0 ? (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {preview.map((f, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--border)] text-xs font-mono text-[var(--accent)] truncate">{f.path}</div>
                    <pre className="p-3 text-xs text-[var(--text-muted)] overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">{f.content.slice(0, 2000)}{f.content.length > 2000 ? "\n…" : ""}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-[var(--text-muted)] mb-4">
                {files.map((f, i) => (
                  <li key={i} className="font-mono text-xs truncate">{f}</li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={confirmCopy}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50"
              >
                Confirm & copy
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  const [findFilesDirections, setFindFilesDirections] = useState<FindFilesDirection[] | null>(null);
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
  const [selectedDirectionIndices, setSelectedDirectionIndices] = useState<Set<number>>(new Set());
  const [selectedProjectIndices, setSelectedProjectIndices] = useState<Set<number>>(new Set());
  const [favoriteDirections, setFavoriteDirections] = useState<FindFilesDirection[]>([]);
  const [compareOwnerA, setCompareOwnerA] = useState("vercel");
  const [compareRepoA, setCompareRepoA] = useState("next.js");
  const [compareOwnerB, setCompareOwnerB] = useState("facebook");
  const [compareRepoB, setCompareRepoB] = useState("react");
  const [compareAnalysisA, setCompareAnalysisA] = useState<RepoAnalysis | null>(null);
  const [compareAnalysisB, setCompareAnalysisB] = useState<RepoAnalysis | null>(null);

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FindFilesDirection[];
        setFavoriteDirections(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = useCallback((dir: FindFilesDirection) => {
    setFavoriteDirections((prev) => {
      const exists = prev.some((d) => d.name === dir.name && d.shortDescription === dir.shortDescription);
      const next = exists ? prev.filter((d) => !(d.name === dir.name && d.shortDescription === dir.shortDescription)) : [...prev, dir].slice(-20);
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((dir: FindFilesDirection) => favoriteDirections.some((d) => d.name === dir.name && d.shortDescription === dir.shortDescription), [favoriteDirections]);

  const setModeAndClear = (m: Mode) => {
    setMode(m);
    setError(null);
    setAnalysis(null);
    setProjects(null);
    setFindFilesDirections(null);
    setCompareAnalysisA(null);
    setCompareAnalysisB(null);
    setSelectedDirectionIndices(new Set());
    setSelectedProjectIndices(new Set());
  };

  async function handleCompare() {
    setLoading(true);
    setError(null);
    setCompareAnalysisA(null);
    setCompareAnalysisB(null);
    try {
      const [resA, resB] = await Promise.all([
        fetch("/api/analyze-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner: compareOwnerA, repo: compareRepoA }),
        }),
        fetch("/api/analyze-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner: compareOwnerB, repo: compareRepoB }),
        }),
      ]);
      const dataA = await resA.json();
      const dataB = await resB.json();
      if (!resA.ok) throw new Error(dataA.error || "Analysis A failed");
      if (!resB.ok) throw new Error(dataB.error || "Analysis B failed");
      setCompareAnalysisA(dataA);
      setCompareAnalysisB(dataB);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compare failed");
    } finally {
      setLoading(false);
    }
  }

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
    setFindFilesDirections(null);
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
      const list = data.directions ?? [];
      setFindFilesDirections(list);
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
    setFindFilesDirections(null);
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
    if (!findFilesDirections || findFilesDirections.length === 0) return;
    try {
      const res = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "findFiles",
          directions: findFilesDirections,
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

  async function handleGenerateScaffolding(direction: FindFilesDirection) {
    if (!direction.missingFiles || direction.missingFiles.length === 0) {
      setToast({ message: "No missing files to generate", type: "error" });
      return;
    }
    try {
      const res = await fetch("/api/generate-scaffolding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directionName: direction.name,
          fullDescription: direction.fullDescription,
          projectDescription,
          missingFiles: direction.missingFiles,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Scaffolding generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${direction.name.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}-scaffolding.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setToast({ message: "Scaffolding downloaded", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Scaffolding failed", type: "error" });
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
      setFindFilesDirections(null);
      setMode("single");
    } else if (entry.type === "findFiles") {
      setProjectDescription(entry.description);
      setFindFilesDirections(Array.isArray(entry.data) && entry.data.length > 0 ? entry.data : null);
      setProjects(null);
      setAnalysis(null);
      setMode("findFiles");
    } else {
      setProjects(entry.data);
      setAnalysis(null);
      setFindFilesDirections(null);
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
          {(history.length > 0 || favoriteDirections.length > 0) && (
            <div className="mb-8 p-5 rounded-[var(--radius-lg)] gradient-border">
              {favoriteDirections.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Saved directions</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {favoriteDirections.map((dir, i) => (
                      <button
                        key={`fav-${i}`}
                        onClick={() => {
                          setFindFilesDirections([dir]);
                          setProjectDescription(dir.name);
                          setMode("findFiles");
                          setError(null);
                          document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium border border-amber-500/30 truncate max-w-[220px]"
                      >
                        ★ {dir.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {history.length > 0 && (
                <>
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
                </>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-card)] border border-[var(--border)] w-fit mb-8">
            {(["single", "discover", "findFiles", "compare"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModeAndClear(m)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-[var(--accent)] text-white shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5"
                }`}
              >
                {m === "single" ? "Repo Analysis" : m === "discover" ? "Discover Projects" : m === "findFiles" ? "Find Reusable Files" : "Compare Repos"}
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
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shine"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {loading ? "Analyzing…" : "Search & analyze"}
                </button>
                <CostEstimate estimate={0.04} label="per analysis" />
              </div>
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
              <div className="flex flex-wrap items-center gap-3">
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
                <CostEstimate estimate={0.08} label="per discovery" />
              </div>
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
              <div className="flex flex-wrap items-center gap-3">
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
                <CostEstimate estimate={0.06} label="per search" />
              </div>
            </div>
          )}

          {mode === "compare" && (
            <div className="space-y-6">
              <p className="text-[var(--text-muted)]">Compare two repositories side-by-side: tech stack, architecture, capabilities.</p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[var(--text-muted)]">Repo A</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={compareOwnerA}
                      onChange={(e) => setCompareOwnerA(e.target.value)}
                      placeholder="Owner"
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <input
                      type="text"
                      value={compareRepoA}
                      onChange={(e) => setCompareRepoA(e.target.value)}
                      placeholder="Repo"
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-[var(--text-muted)]">Repo B</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={compareOwnerB}
                      onChange={(e) => setCompareOwnerB(e.target.value)}
                      placeholder="Owner"
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                    <input
                      type="text"
                      value={compareRepoB}
                      onChange={(e) => setCompareRepoB(e.target.value)}
                      placeholder="Repo"
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shine flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Comparing…
                    </>
                  ) : (
                    "Compare repos"
                  )}
                </button>
                <CostEstimate estimate={0.08} label="per compare" />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>
          )}

          {compareAnalysisA && compareAnalysisB && mode === "compare" && (
            <div className="mt-12 grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[var(--accent)]">{compareOwnerA}/{compareRepoA}</h2>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Tech stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {compareAnalysisA.techStack.map((t, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-[var(--bg-elevated)] text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Summary</h3>
                    <p className="text-[var(--text-muted)] text-sm line-clamp-4">{compareAnalysisA.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Capabilities</h3>
                    <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                      {compareAnalysisA.capabilities.slice(0, 5).map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[var(--accent)]">{compareOwnerB}/{compareRepoB}</h2>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Tech stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {compareAnalysisB.techStack.map((t, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-[var(--bg-elevated)] text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Summary</h3>
                    <p className="text-[var(--text-muted)] text-sm line-clamp-4">{compareAnalysisB.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Capabilities</h3>
                    <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                      {compareAnalysisB.capabilities.slice(0, 5).map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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

              {"migrationSuggestions" in analysis && Array.isArray(analysis.migrationSuggestions) && (analysis.migrationSuggestions as { from: string; to: string; reason: string; steps: string[] }[]).length > 0 && (
                <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-lg font-semibold mb-4">Migration suggestions</h2>
                  <div className="space-y-4">
                    {(analysis.migrationSuggestions as { from: string; to: string; reason: string; steps: string[] }[]).map((m, i) => (
                      <div key={i} className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[var(--text-muted)]">{m.from}</span>
                          <span className="text-amber-400">→</span>
                          <span className="font-medium text-[var(--accent)]">{m.to}</span>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm mb-3">{m.reason}</p>
                        <ul className="space-y-1 text-sm text-[var(--text-subtle)]">
                          {m.steps.map((s, j) => (
                            <li key={j} className="flex gap-2">
                              <span className="text-[var(--accent)]">{j + 1}.</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
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

              {selectedProjectIndices.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <span className="text-sm text-[var(--text-muted)]">
                    {selectedProjectIndices.size} project{selectedProjectIndices.size !== 1 ? "s" : ""} selected
                  </span>
                  <CopyToRepoButton
                    files={Array.from(selectedProjectIndices).flatMap((i) => projects[i].existingFiles)}
                    projectName="selected-projects"
                  />
                  <button
                    onClick={() => setSelectedProjectIndices(new Set())}
                    className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-white/5"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {projects.map((p, i) => (
                  <section key={i} className="rounded-[var(--radius-lg)] gradient-border p-6">
                    <div className="flex items-start gap-3 mb-2">
                      <label className="flex items-center pt-0.5 shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjectIndices.has(i)}
                          onChange={() => {
                            setSelectedProjectIndices((prev) => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i);
                              else next.add(i);
                              return next;
                            });
                          }}
                          className="rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)]"
                        />
                      </label>
                      <div className="flex-1 flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-[var(--accent)]">{p.name}</h3>
                        {getCompletenessBadge(p.completenessNote, p.missingFiles.length)}
                      </div>
                    </div>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{p.description}</p>
                    <p className="text-amber-400/90 text-sm font-medium mb-3">{p.completenessNote}</p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                          <h4 className="font-medium text-[var(--text-muted)]">Existing files</h4>
                          <div className="flex gap-2 flex-wrap">
                            <CopyButton text={p.existingFiles.join("\n")} label="Copy" />
                            {p.existingFiles.length > 0 && (
                              <>
                                <CopyToRepoButton files={p.existingFiles} projectName={p.name} />
                                <DependencyViewer files={p.existingFiles} />
                              </>
                            )}
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
              <div className="pt-4">
                <FeedbackThumbs target="discover" feedbackType="discover" />
              </div>
              </div>
            </div>
          )}

          {findFilesDirections && mode === "findFiles" && (
            <div className="mt-12 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Directions for: &quot;{projectDescription}&quot;</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleShare(`Files for: ${projectDescription}`, "findFiles", { directions: findFilesDirections })}
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
                </div>
              </div>

              {selectedDirectionIndices.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <span className="text-sm text-[var(--text-muted)]">
                    {selectedDirectionIndices.size} direction{selectedDirectionIndices.size !== 1 ? "s" : ""} selected
                  </span>
                  <CopyToRepoButton
                    files={Array.from(selectedDirectionIndices).flatMap((i) =>
                      findFilesDirections[i].existingFiles.map((f) => f.path)
                    )}
                    projectName={projectDescription.replace(/\s+/g, "-").toLowerCase().slice(0, 30)}
                  />
                  <button
                    onClick={async () => {
                      const selected = findFilesDirections.filter((_, i) => selectedDirectionIndices.has(i));
                      try {
                        const res = await fetch("/api/blueprint", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "findFiles",
                            directions: selected,
                            findFilesTitle: projectDescription,
                          }),
                        });
                        if (!res.ok) throw new Error("Export failed");
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `selected-directions-${Date.now()}.pdf`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setToast({ message: "PDF exported", type: "success" });
                      } catch (e) {
                        setToast({ message: e instanceof Error ? e.message : "Export failed", type: "error" });
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    Export selected to PDF
                  </button>
                  <button
                    onClick={() => setSelectedDirectionIndices(new Set())}
                    className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-white/5"
                  >
                    Clear selection
                  </button>
                </div>
              )}

              <div className="space-y-6">
                {findFilesDirections.map((dir, idx) => (
                  <DirectionCard
                    key={idx}
                    direction={dir}
                    projectDescription={projectDescription}
                    onCopyToRepo={() => {}}
                    onGenerateScaffolding={() => handleGenerateScaffolding(dir)}
                    CopyToRepoButton={CopyToRepoButton}
                    CopyButton={CopyButton}
                    selected={selectedDirectionIndices.has(idx)}
                    onToggleSelect={() => {
                      setSelectedDirectionIndices((prev) => {
                        const next = new Set(prev);
                        if (next.has(idx)) next.delete(idx);
                        else next.add(idx);
                        return next;
                      });
                    }}
                    isFavorite={isFavorite(dir)}
                    onToggleFavorite={() => toggleFavorite(dir)}
                  />
                ))}
                <div className="pt-4">
                  <FeedbackThumbs target={`findFiles:${projectDescription}`} feedbackType="findFiles" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <FeatureShowcase onNavigateToTool={setModeAndClear} />
      <PremiumFooter onNavigateToTool={setModeAndClear} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
