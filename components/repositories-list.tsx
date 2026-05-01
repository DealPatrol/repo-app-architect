'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { Repository } from '@/lib/queries'

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
    </svg>
  )
}

function BitbucketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 0 0 .77-.646l3.27-20.03a.768.768 0 0 0-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z" />
    </svg>
  )
}

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

interface PlatformRepo {
  id: number | string
  name: string
  full_name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  default_branch: string
  private: boolean
  platform: 'github' | 'gitlab' | 'bitbucket'
}

type Platform = 'github' | 'gitlab' | 'bitbucket'

export function RepositoriesList({ repositories }: RepositoriesListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [auth, setAuth] = useState<AuthStatus | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const [platformRepos, setPlatformRepos] = useState<Record<Platform, PlatformRepo[]>>({
    github: [],
    gitlab: [],
    bitbucket: [],
  })
  const [platformConnected, setPlatformConnected] = useState<Record<Platform, boolean>>({
    github: false,
    gitlab: false,
    bitbucket: false,
  })
  const [platformLoading, setPlatformLoading] = useState<Record<Platform, boolean>>({
    github: false,
    gitlab: false,
    bitbucket: false,
  })

  const [selectedRepos, setSelectedRepos] = useState<(number | string)[]>([])
  const [importing, setImporting] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const [addingManualRepo, setAddingManualRepo] = useState(false)
  const [error, setError] = useState('')

  const importedGithubIds = useMemo(
    () => new Set(repositories.map((repo) => repo.github_id)),
    [repositories],
  )

  const oauthError = searchParams.get('error')
  const oauthConnected = searchParams.get('connected') as Platform | null

  const loadPlatformRepos = useCallback(async (platform: Platform) => {
    setPlatformLoading((prev) => ({ ...prev, [platform]: true }))
    setError('')
    try {
      const endpoint = platform === 'github' ? '/api/github/repos' : `/api/${platform}/repos`
      const res = await fetch(endpoint, { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Failed to load ${platform} repositories` }))
        if (res.status === 401) {
          setPlatformConnected((prev) => ({ ...prev, [platform]: false }))
          return
        }
        throw new Error(data.error || `Failed to load ${platform} repositories`)
      }
      const data = (await res.json()) as PlatformRepo[]
      setPlatformRepos((prev) => ({ ...prev, [platform]: data }))
      setPlatformConnected((prev) => ({ ...prev, [platform]: true }))
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${platform} repositories`)
    } finally {
      setPlatformLoading((prev) => ({ ...prev, [platform]: false }))
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
        await loadPlatformRepos('github')
      }
    } catch (err) {
      setAuth({ authenticated: false, error: err instanceof Error ? err.message : 'Failed to load auth' })
    } finally {
      setLoadingAuth(false)
    }
  }, [loadPlatformRepos])

  useEffect(() => {
    void loadAuthStatus()
  }, [loadAuthStatus])

  // When coming back from GitLab/Bitbucket OAuth, load their repos
  useEffect(() => {
    if (oauthConnected === 'gitlab') {
      void loadPlatformRepos('gitlab')
      router.replace('/dashboard/repositories', { scroll: false })
    } else if (oauthConnected === 'bitbucket') {
      void loadPlatformRepos('bitbucket')
      router.replace('/dashboard/repositories', { scroll: false })
    } else if (oauthConnected === 'github' && auth?.authenticated) {
      router.replace('/dashboard/repositories', { scroll: false })
    }
  }, [oauthConnected, auth?.authenticated, loadPlatformRepos, router])

  const handleImportSelected = async () => {
    const reposToImport = selectedRepos.filter((id) =>
      typeof id === 'number' ? !importedGithubIds.has(id) : true
    )

    if (reposToImport.length === 0) {
      setError('Select at least one repository that has not already been imported.')
      return
    }

    setImporting(true)
    setError('')

    try {
      // For GitHub repos use the existing import endpoint with numeric IDs
      const githubIds = reposToImport.filter((id): id is number => typeof id === 'number')
      // For non-GitHub repos, find the full repo objects and add them by URL
      const nonGithubRepos = [...platformRepos.gitlab, ...platformRepos.bitbucket].filter((r) =>
        reposToImport.includes(r.id)
      )

      const promises: Promise<Response>[] = []

      if (githubIds.length > 0) {
        promises.push(
          fetch('/api/repositories/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repositoryIds: githubIds }),
          })
        )
      }

      for (const repo of nonGithubRepos) {
        promises.push(
          fetch('/api/repositories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: repo.url }),
          })
        )
      }

      const results = await Promise.all(promises)
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        throw new Error(`${failed.length} repositories failed to import`)
      }

      setSelectedRepos([])
      router.refresh()
      await loadPlatformRepos('github')
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
      if (res.ok) router.refresh()
    } catch {
      setError('Failed to remove repository')
    }
  }

  const toggleSelection = (id: number | string) => {
    setSelectedRepos((current) =>
      current.includes(id) ? current.filter((rid) => rid !== id) : [...current, id],
    )
  }

  const allRepos = [...platformRepos.github, ...platformRepos.gitlab, ...platformRepos.bitbucket]

  function PlatformRepoList({ platform }: { platform: Platform }) {
    const repos = platformRepos[platform]
    const loading = platformLoading[platform]
    const connected = platformConnected[platform]

    const platformLabel = platform === 'github' ? 'GitHub' : platform === 'gitlab' ? 'GitLab' : 'Bitbucket'
    const loginHref = `/api/auth/${platform}/login`

    if (platform === 'github' && loadingAuth) {
      return (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking GitHub connection...
        </div>
      )
    }

    if (platform === 'github' && !auth?.authenticated) {
      return (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <Github className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <h3 className="font-semibold text-foreground">Connect your GitHub account</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Once you sign in, CodeVault can read your repositories and show what you can build
            from the code you already own.
          </p>
          <Button className="mt-4" asChild>
            <a href={loginHref}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Continue with GitHub
            </a>
          </Button>
        </div>
      )
    }

    if (!connected && !loading) {
      return (
        <div className="rounded-xl border border-dashed p-10 text-center">
          {platform === 'gitlab' ? (
            <GitLabIcon className="mx-auto mb-3 h-10 w-10 text-orange-400/60" />
          ) : platform === 'bitbucket' ? (
            <BitbucketIcon className="mx-auto mb-3 h-10 w-10 text-blue-400/60" />
          ) : (
            <Github className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          )}
          <h3 className="font-semibold text-foreground">Connect your {platformLabel} account</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Sign in with {platformLabel} to import repositories and include them in your AI analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <Button asChild>
              <a href={loginHref}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Connect {platformLabel}
              </a>
            </Button>
            <Button variant="outline" onClick={() => loadPlatformRepos(platform)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check connection'}
            </Button>
          </div>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading {platformLabel} repositories...
        </div>
      )
    }

    if (repos.length === 0) {
      return (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <FolderGit2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <h3 className="font-semibold text-foreground">No {platformLabel} repositories found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not find any repositories on your connected {platformLabel} account.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => loadPlatformRepos(platform)}>
            Refresh
          </Button>
        </div>
      )
    }

    const selectableIds = repos
      .filter((r) => typeof r.id === 'string' || !importedGithubIds.has(r.id as number))
      .map((r) => r.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedRepos.includes(id))

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {repos.length} repositories available
            </span>
            {connected && (
              <span className="flex items-center gap-1 text-xs text-chart-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedRepos.length} selected</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedRepos((prev) => [...new Set([...prev, ...selectableIds])])}
              disabled={importing || allSelected || selectableIds.length === 0}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRepos([])}
              disabled={importing || selectedRepos.length === 0}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPlatformRepos(platform)}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {repos.map((repo) => {
            const alreadyImported =
              typeof repo.id === 'number' && importedGithubIds.has(repo.id)
            return (
              <Card key={String(repo.id)} className="p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={alreadyImported || selectedRepos.includes(repo.id)}
                    disabled={alreadyImported || importing}
                    onCheckedChange={() => toggleSelection(repo.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{repo.full_name}</span>
                      {repo.private ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Private</span>
                      ) : null}
                      {alreadyImported ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Imported</span>
                      ) : null}
                    </div>
                    {repo.description ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {repo.language ? <span>{repo.language}</span> : null}
                      {typeof repo.stars === 'number' && repo.stars > 0 ? (
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                      ) : null}
                      <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{repo.default_branch}</span>
                    </div>
                  </div>
                </label>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const defaultTab = oauthConnected ?? 'github'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
          <p className="text-muted-foreground">
            Connect GitHub, GitLab, or Bitbucket to import and track repositories.
          </p>
        </div>
        {!loadingAuth && auth?.authenticated && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              GitHub: <span className="font-medium text-foreground">@{auth.user?.github_username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                setAuth({ authenticated: false })
                setPlatformRepos({ github: [], gitlab: [], bitbucket: [] })
                setPlatformConnected({ github: false, gitlab: false, bitbucket: false })
                setSelectedRepos([])
              }}
            >
              Sign out
            </Button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {(oauthConnected || error || auth?.error || oauthError) && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            oauthConnected
              ? 'border-chart-1/30 bg-chart-1/5 text-chart-1'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {oauthConnected ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <span>
            {oauthConnected
              ? `${oauthConnected.charAt(0).toUpperCase() + oauthConnected.slice(1)} connected successfully. You can now import repositories.`
              : error || auth?.error || `Sign-in failed: ${oauthError}`}
          </span>
        </div>
      )}

      {/* Platform import tabs */}
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">Import from a platform</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect any platform to list and import your repositories.
          </p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6 h-auto gap-1 p-1">
            <TabsTrigger value="github" className="flex items-center gap-2 px-4 py-2">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              {platformConnected.github && (
                <span className="ml-1 h-2 w-2 rounded-full bg-chart-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="gitlab" className="flex items-center gap-2 px-4 py-2">
              <GitLabIcon className="h-4 w-4 text-orange-500" />
              <span>GitLab</span>
              {platformConnected.gitlab && (
                <span className="ml-1 h-2 w-2 rounded-full bg-chart-1" />
              )}
            </TabsTrigger>
            <TabsTrigger value="bitbucket" className="flex items-center gap-2 px-4 py-2">
              <BitbucketIcon className="h-4 w-4 text-blue-500" />
              <span>Bitbucket</span>
              {platformConnected.bitbucket && (
                <span className="ml-1 h-2 w-2 rounded-full bg-chart-1" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github">
            <PlatformRepoList platform="github" />
          </TabsContent>
          <TabsContent value="gitlab">
            <PlatformRepoList platform="gitlab" />
          </TabsContent>
          <TabsContent value="bitbucket">
            <PlatformRepoList platform="bitbucket" />
          </TabsContent>
        </Tabs>

        {/* Import button — shown when repos from any platform are selected */}
        {selectedRepos.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-6">
            <span className="text-sm text-muted-foreground">
              {selectedRepos.length} repositor{selectedRepos.length === 1 ? 'y' : 'ies'} selected
            </span>
            <Button onClick={handleImportSelected} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Import selected
            </Button>
          </div>
        )}
      </Card>

      {/* Tracked repos */}
      <Card className="p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tracked repositories</h2>
          <p className="text-sm text-muted-foreground">
            These repositories are imported and ready for AI analysis.
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="manual-repo-url">Add a public repository by URL</Label>
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              id="manual-repo-url"
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleManualAdd() }}
              placeholder="https://github.com/owner/repo or https://gitlab.com/..."
              disabled={addingManualRepo}
            />
            <Button onClick={handleManualAdd} disabled={addingManualRepo} className="shrink-0">
              {addingManualRepo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add repository
            </Button>
          </div>
        </div>

        {repositories.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <FolderGit2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground">No repositories imported yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Import repositories from GitHub, GitLab, or Bitbucket above, or paste a public URL.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo) => (
              <Card key={repo.id} className="group p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(repo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="mb-1 font-semibold text-foreground truncate">{repo.name}</h3>
                <p className="mb-1 text-xs text-muted-foreground truncate">{repo.full_name}</p>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {repo.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {repo.language ? <span>{repo.language}</span> : null}
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" />{repo.stars}</span>
                  <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{repo.default_branch}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary of all available repos for quick cross-platform awareness */}
        {allRepos.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {platformConnected.github && (
              <span className="flex items-center gap-1">
                <Github className="h-3 w-3" />
                {platformRepos.github.length} GitHub repos loaded
              </span>
            )}
            {platformConnected.gitlab && (
              <span className="flex items-center gap-1">
                <GitLabIcon className="h-3 w-3 text-orange-500" />
                {platformRepos.gitlab.length} GitLab projects loaded
              </span>
            )}
            {platformConnected.bitbucket && (
              <span className="flex items-center gap-1">
                <BitbucketIcon className="h-3 w-3 text-blue-500" />
                {platformRepos.bitbucket.length} Bitbucket repos loaded
              </span>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
