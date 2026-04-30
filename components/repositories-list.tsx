'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ExternalLink,
  FolderGit2,
  Github,
  GitBranch,
  Loader2,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
} from 'lucide-react'
import type { Repository } from '@/lib/queries'

interface RepositoriesListProps {
  repositories: Repository[]
}

interface AuthStatus {
  authenticated: boolean
  user?: {
    github_id: number
    github_username: string
    github_avatar_url: string | null
  }
  error?: string
}

interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  default_branch: string
  private: boolean
}

export function RepositoriesList({ repositories }: RepositoriesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [auth, setAuth] = useState<AuthStatus | null>(null)
  const [githubRepos, setGitHubRepos] = useState<GitHubRepository[]>([])
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [loadingGitHubRepos, setLoadingGitHubRepos] = useState(false)
  const [importing, setImporting] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [addingManualRepo, setAddingManualRepo] = useState(false)
  const [error, setError] = useState('')

  const importedGithubIds = useMemo(
    () => new Set(repositories.map((repo) => repo.github_id)),
    [repositories],
  )

  const selectableGithubIds = useMemo(
    () => githubRepos.filter((repo) => !importedGithubIds.has(repo.id)).map((repo) => repo.id),
    [githubRepos, importedGithubIds],
  )

  const allSelectableSelected = useMemo(() => {
    if (selectableGithubIds.length === 0) return false
    return selectableGithubIds.every((id) => selectedRepos.includes(id))
  }, [selectableGithubIds, selectedRepos])
  const oauthError = searchParams.get('error')
  const oauthConnected = searchParams.get('connected')

  const loadGitHubRepos = useCallback(async () => {
    setLoadingGitHubRepos(true)
    setError('')
    try {
      const res = await fetch('/api/github/repos', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to load GitHub repositories' }))
        throw new Error(data.error || 'Failed to load GitHub repositories')
      }

      const data = await res.json()
      setGitHubRepos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GitHub repositories')
    } finally {
      setLoadingGitHubRepos(false)
    }
  }, [])

  const loadAuthStatus = useCallback(async () => {
    setLoadingAuth(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) {
        setAuth({ authenticated: false })
        return
      }

      const data = await res.json()
      setAuth(data)
      if (data.authenticated) {
        await loadGitHubRepos()
      }
    } catch (err) {
      setAuth({ authenticated: false, error: err instanceof Error ? err.message : 'Failed to load auth status' })
    } finally {
      setLoadingAuth(false)
    }
  }, [loadGitHubRepos])

  useEffect(() => {
    void loadAuthStatus()
  }, [loadAuthStatus])

  useEffect(() => {
    if (auth?.authenticated && oauthConnected) {
      router.replace('/dashboard/repositories', { scroll: false })
    }
  }, [auth?.authenticated, oauthConnected, router])

  const handleImportSelected = async () => {
    const reposToImport = selectedRepos.filter((id) => !importedGithubIds.has(id))
    if (reposToImport.length === 0) {
      setError('Select at least one repository that has not already been imported.')
      return
    }

    setImporting(true)
    setError('')

    try {
      const res = await fetch('/api/repositories/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryIds: reposToImport }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to import repositories' }))
        throw new Error(data.error || 'Failed to import repositories')
      }

      setSelectedRepos([])
      router.refresh()
      await loadGitHubRepos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repositories')
    } finally {
      setImporting(false)
    }
  }

  const handleManualAdd = async () => {
    if (!manualUrl.trim()) {
      setError('Please enter a repository URL')
      return
    }

    setAddingManualRepo(true)
    setError('')

    try {
      const res = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: manualUrl.trim() }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to add repository' }))
        throw new Error(data.error || 'Failed to add repository')
      }

      setManualUrl('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add repository')
    } finally {
      setAddingManualRepo(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this repository?')) return

    try {
      const res = await fetch(`/api/repositories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      setError('Failed to remove repository')
    }
  }

  const toggleSelection = (id: number) => {
    setSelectedRepos((current) =>
      current.includes(id) ? current.filter((repoId) => repoId !== id) : [...current, id],
    )
  }

  const selectAllSelectable = () => {
    setSelectedRepos(selectableGithubIds)
  }

  const clearImportSelection = () => {
    setSelectedRepos([])
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect GitHub repositories to scan for hidden applications.</p>
        </div>
        {loadingAuth ? (
          <Button variant="outline" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Checking GitHub
          </Button>
        ) : auth?.authenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">@{auth.user?.github_username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                setAuth({ authenticated: false })
                setGitHubRepos([])
                setSelectedRepos([])
              }}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <Button asChild>
            <a href="/api/auth/github/login">
              <Github className="h-4 w-4 mr-2" />
              Sign in with GitHub
            </a>
          </Button>
        )}
      </div>

      {(oauthConnected || error || auth?.error || oauthError) && (
        <Card className={oauthConnected
          ? 'border-primary/30 bg-primary/5 p-4 text-sm text-primary'
          : 'border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'
        }>
          {oauthConnected
            ? 'GitHub connected successfully. You can import repositories now.'
            : error || auth?.error || `GitHub sign-in failed: ${oauthError}`}
        </Card>
      )}

      {/* GitHub import */}
      <Card className="p-6 space-y-4 bg-card/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground">GitHub import</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Import public and private repositories from your GitHub account.
            </p>
          </div>
          {auth?.authenticated ? (
            <Button variant="outline" size="sm" onClick={() => void loadGitHubRepos()} disabled={loadingGitHubRepos}>
              {loadingGitHubRepos ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          ) : null}
        </div>

        {!auth?.authenticated ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Github className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Connect your GitHub account</h3>
            <p className="mx-auto mt-1.5 max-w-lg text-xs text-muted-foreground">
              Sign in to import repositories and let CodeVault discover what you can build from the code you already own.
            </p>
            <Button className="mt-4" size="sm" asChild>
              <a href="/api/auth/github/login">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Continue with GitHub
              </a>
            </Button>
          </div>
        ) : loadingGitHubRepos ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading repositories from GitHub...
          </div>
        ) : githubRepos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <FolderGit2 className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">No repositories found</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              No repositories found on your connected GitHub account.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {githubRepos.length} repositories available
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{selectedRepos.length} selected</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAllSelectable}
                  disabled={importing || loadingGitHubRepos || selectableGithubIds.length === 0 || allSelectableSelected}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearImportSelection}
                  disabled={importing || selectedRepos.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {githubRepos.map((repo) => {
                const alreadyImported = importedGithubIds.has(repo.id)
                return (
                  <div key={repo.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                      <Checkbox
                        checked={alreadyImported || selectedRepos.includes(repo.id)}
                        disabled={alreadyImported || importing}
                        onCheckedChange={() => toggleSelection(repo.id)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-sm text-foreground">{repo.full_name}</span>
                          {repo.private && (
                            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Private</span>
                          )}
                          {alreadyImported && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-medium">Imported</span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{repo.description}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {repo.language && <span className="text-primary/80 font-medium">{repo.language}</span>}
                          <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{repo.stars}</span>
                          <span className="flex items-center gap-0.5"><GitBranch className="h-3 w-3" />{repo.default_branch}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleImportSelected} disabled={importing || selectedRepos.length === 0}>
                {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Import selected
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tracked repos */}
      <Card className="p-6 space-y-4 bg-card/60">
        <div>
          <h2 className="font-semibold text-foreground">Tracked repositories</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Repositories CodeVault can analyze right now.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="manual-repo-url" className="text-sm">Add a public repository by URL</Label>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              id="manual-repo-url"
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
              disabled={addingManualRepo}
            />
            <Button onClick={handleManualAdd} disabled={addingManualRepo} className="flex-shrink-0">
              {addingManualRepo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add
            </Button>
          </div>
        </div>

        {repositories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <FolderGit2 className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">No repositories imported yet</h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Import from GitHub above, or add a public repository URL manually.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <Card key={repo.id} className="group p-4 bg-background/50 hover:bg-background/80 transition-colors">
                <div className="mb-3 flex items-start justify-between">
                  <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center">
                    <FolderGit2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(repo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm">{repo.name}</h3>
                <p className="text-xs text-muted-foreground">{repo.full_name}</p>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  {repo.description || 'No description'}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {repo.language && <span className="text-primary/80 font-medium">{repo.language}</span>}
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{repo.stars}</span>
                  <span className="flex items-center gap-0.5"><GitBranch className="h-3 w-3" />{repo.default_branch}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
