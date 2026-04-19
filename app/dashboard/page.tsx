'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Github, Sparkles, Zap, GitBranch, BarChart3, Plus } from 'lucide-react'

const platforms = [
  { name: 'GitHub', icon: Github, connected: true, repos: 24 },
  { name: 'Vercel', icon: Zap, connected: false, repos: 0 },
  { name: 'Replit', icon: GitBranch, connected: false, repos: 0 },
]

const recentIdeas = [
  { name: 'SaaS Dashboard', match: 94, status: 'Ready to build', files: 12, missing: 1 },
  { name: 'Auth Starter Kit', match: 88, status: 'Quick win', files: 8, missing: 2 },
  { name: 'API Boilerplate', match: 76, status: 'Good match', files: 9, missing: 3 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect platforms and discover what you can ship from your existing code.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ideas found', value: '0' },
          { label: 'Ready to build', value: '0' },
          { label: 'Platforms connected', value: '1' },
          { label: 'Files scanned', value: '0' },
        ].map((s) => (
          <Card key={s.label} className="p-4 border-border bg-card">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Platforms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Connected Platforms</h2>
          <Button variant="ghost" size="sm" className="text-cv-indigo hover:text-cv-indigo h-7 text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Add platform
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {platforms.map((p) => (
            <Card
              key={p.name}
              className={`p-4 border flex items-center gap-3 ${
                p.connected ? 'border-cv-indigo-border bg-cv-indigo-dim' : 'border-border bg-card'
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                p.connected ? 'bg-cv-indigo/20' : 'bg-muted'
              }`}>
                <p.icon className={`h-4 w-4 ${p.connected ? 'text-cv-indigo' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.connected ? `${p.repos} repos connected` : 'Not connected'}
                </p>
              </div>
              {p.connected
                ? <span className="text-xs text-cv-indigo font-mono">Active</span>
                : (
                  <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">
                    Connect
                  </Button>
                )}
            </Card>
          ))}
        </div>
      </div>

      {/* CTA to scan */}
      <Card className="p-6 border border-cv-indigo-border bg-cv-indigo-dim">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-cv-indigo/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-cv-indigo" />
            </div>
            <div>
              <h3 className="font-semibold">Run your first scan</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select repos to analyze and discover apps you can build. The average developer finds 7 ideas.
              </p>
            </div>
          </div>
          <Button asChild className="bg-cv-indigo hover:bg-cv-indigo/90 text-white shrink-0 rounded-lg">
            <Link href="/dashboard/repositories">
              Start scanning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* Recent ideas (placeholder) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent Ideas</h2>
          <Link href="/dashboard/analyses" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          {recentIdeas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No ideas yet. Run a scan to discover what you can build.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">App</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium hidden md:table-cell">Match</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Missing</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {recentIdeas.map((idea, i) => (
                  <tr key={idea.name} className={`${i < recentIdeas.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/20 transition-colors`}>
                    <td className="px-4 py-3 font-medium">{idea.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted max-w-16">
                          <div className="h-1.5 rounded-full bg-cv-indigo" style={{ width: `${idea.match}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{idea.match}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        idea.match >= 90 ? 'bg-green-500/10 text-green-400' :
                        idea.match >= 80 ? 'bg-cv-indigo-dim text-cv-indigo' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{idea.missing} file{idea.missing !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link href="/dashboard/analyses">
                          View <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
