'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Github, Sparkles, Zap, GitBranch, BarChart3, Plus, CheckCircle2 } from 'lucide-react'

interface Repo {
  github_id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stars: number
}

interface UserState {
  username: string | null
  repoCount: number
  loading: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserState>({ username: null, repoCount: 0, loading: true })

  useEffect(() => {
    async function loadUser() {
      try {
        const [userResult, reposResult] = await Promise.allSettled([
          fetch('/api/auth/me'),
          fetch('/api/github/repos'),
        ])

        let username: string | null = null
        let repoCount = 0

        if (userResult.status === 'fulfilled' && userResult.value.ok) {
          const userData = await userResult.value.json()
          username = userData.username ?? null
        }

        if (reposResult.status === 'fulfilled' && reposResult.value.ok) {
          const repos: Repo[] = await reposResult.value.json()
          repoCount = repos.length
        }

        setUser({ username, repoCount, loading: false })
      } catch {
        setUser({ username: null, repoCount: 0, loading: false })
      }
    }
    loadUser()
  }, [])

  const isConnected = !user.loading && user.username !== null

  const platforms = [
    { name: 'GitHub', icon: Github, connected: isConnected, repos: user.repoCount },
    { name: 'Vercel', icon: Zap, connected: false, repos: 0 },
    { name: 'Replit', icon: GitBranch, connected: false, repos: 0 },
  ]

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {user.loading ? (
            <Skeleton className="h-7 w-48" />
          ) : user.username ? (
            <>Welcome back, <span className="text-cv-indigo">{user.username}</span></>
          ) : (
            'Overview'
          )}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect platforms and discover what you can ship from your existing code.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ideas found', value: '0' },
          { label: 'Ready to build', value: '0' },
          { label: 'Platforms connected', value: isConnected ? '1' : '0' },
          { label: 'Repos scanned', value: user.loading ? '…' : String(user.repoCount) },
        ].map((s) => (
          <Card key={s.label} className="p-4 border-border bg-card">
            {user.loading ? (
              <Skeleton className="h-7 w-12 mb-1" />
            ) : (
              <p className="text-2xl font-bold">{s.value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Not logged in CTA */}
      {!user.loading && !isConnected && (
        <Card className="p-6 border border-amber-500/30 bg-amber-500/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Sign in with GitHub to get started</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Connect your GitHub account to scan your repos and discover apps you can build.
              </p>
            </div>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90 shrink-0">
              <a href={`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`}>
                <Github className="h-4 w-4 mr-2" />
                Sign in with GitHub
              </a>
            </Button>
          </div>
        </Card>
      )}

      {/* Platforms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Connected Platforms</h2>
          <Button variant="ghost" size="sm" className="text-accent hover:text-accent h-7 text-xs gap-1" asChild>
            <Link href="/dashboard/repositories">
              <Plus className="h-3.5 w-3.5" /> Add platform
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {platforms.map((p) => (
            <Card
              key={p.name}
              className={`p-4 border flex items-center gap-3 transition-colors ${
                p.connected ? 'border-cv-indigo-border bg-cv-indigo-dim' : 'border-border bg-card'
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                p.connected ? 'bg-cv-indigo/20' : 'bg-muted'
              }`}>
                <p.icon className={`h-4 w-4 ${p.connected ? 'text-accent' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.connected ? `${p.repos} repos` : 'Not connected'}
                </p>
              </div>
              {p.connected ? (
                <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">
                  Connect
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* CTA to scan — only show when connected */}
      {isConnected && (
        <Card className="p-6 border border-cv-indigo-border bg-cv-indigo-dim">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-cv-indigo/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Run your first scan</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Select repos to analyze and discover apps you can build. The average developer finds 7 ideas.
                </p>
              </div>
            </div>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0 rounded-lg">
              <Link href="/dashboard/repositories">
                Start scanning
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Recent ideas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Ideas</h2>
          <Link href="/dashboard/analyses" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="p-12 text-center text-muted-foreground text-sm">
            No ideas yet. Run a scan to discover what you can build.
          </div>
        </div>
      </div>

      {/* Code intel teaser */}
      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Code Intelligence</h3>
          <span className="ml-auto text-xs text-muted-foreground font-mono px-2 py-0.5 border border-border rounded-full">Pro</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Deep insights into your tech stack distribution, component reusability scores, and build velocity across all connected platforms.
        </p>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <Link href="/#pricing">Upgrade to Pro <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
        </Button>
      </Card>
    </div>
  )
}
