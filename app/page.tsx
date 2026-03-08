'use client'

import { useState } from 'react'
import Link from 'next/link'

type DiscoveredProject = {
  name: string
  description: string
  existingFiles: string[]
  missingFiles: string[]
  completenessNote: string
}

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<DiscoveredProject[] | null>(null)
  const [options, setOptions] = useState({
    limit: 40,
    projectCount: 5,
    excludeForks: true,
    excludeArchived: true,
  })

  async function handleDiscover() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/discover-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Discovery failed')
      setProjects(data.potentialProjects ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed')
      setProjects(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleExportPdf() {
    if (!projects || projects.length === 0) return
    const res = await fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'discovered', projects }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Export failed')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discovered-projects-${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Repo Architect</h1>
            <p className="mt-2 text-muted-foreground">
              Discover near-complete product ideas from your GitHub repos and export them to PDF.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Open TaskFlow dashboard
          </Link>
        </div>

        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Discovery settings</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Repositories</span>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                min={5}
                max={100}
                value={options.limit}
                onChange={(e) => setOptions((prev) => ({ ...prev, limit: Number(e.target.value) }))}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Project ideas</span>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2"
                min={3}
                max={20}
                value={options.projectCount}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, projectCount: Number(e.target.value) }))
                }
              />
            </label>
            <label className="mt-7 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.excludeForks}
                onChange={(e) => setOptions((prev) => ({ ...prev, excludeForks: e.target.checked }))}
              />
              Exclude forks
            </label>
            <label className="mt-7 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.excludeArchived}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, excludeArchived: e.target.checked }))
                }
              />
              Exclude archived
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleDiscover}
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? 'Scanning repositories…' : 'Discover projects'}
            </button>
            <button
              onClick={handleExportPdf}
              disabled={!projects || projects.length === 0}
              className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-60"
            >
              Export discovered projects PDF
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </section>

        {projects && (
          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">Discovered projects ({projects.length})</h2>
            {projects.map((project, index) => (
              <article key={`${project.name}-${index}`} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-lg font-semibold">
                  {index + 1}. {project.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  {project.completenessNote}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium">Existing files</h4>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {project.existingFiles.map((filePath, fileIndex) => (
                        <li key={`${filePath}-${fileIndex}`}>• {filePath}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Files to create</h4>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {project.missingFiles.map((filePath, fileIndex) => (
                        <li key={`${filePath}-${fileIndex}`}>+ {filePath}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
