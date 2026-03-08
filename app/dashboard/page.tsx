import { getAllRepositories, getAllAnalyses } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FolderGit2, Sparkles, Code2, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  let repositories: any[] = []
  let analyses: any[] = []

  try {
    repositories = await getAllRepositories()
    analyses = await getAllAnalyses()
  } catch {
    // Database not available yet
  }

  const completedAnalyses = analyses.filter(a => a.status === 'complete')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Dashboard</h1>
        <p className="text-muted-foreground">Discover what apps you can build from your existing code.</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Repositories</p>
              <p className="text-2xl font-bold text-foreground">{repositories.length}</p>
            </div>
            <FolderGit2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Analyses</p>
              <p className="text-2xl font-bold text-foreground">{analyses.length}</p>
            </div>
            <Sparkles className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Apps Discovered</p>
              <p className="text-2xl font-bold text-foreground">{completedAnalyses.length > 0 ? '—' : '0'}</p>
            </div>
            <Code2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Get Started</h2>
        
        {repositories.length === 0 ? (
          <Card className="border-dashed p-8 text-center">
            <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No repositories yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Start by adding your GitHub repositories. We will scan all files and prepare them for AI analysis.
            </p>
            <Button asChild>
              <Link href="/dashboard/repositories">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {repositories.length} connected
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Repositories</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your connected GitHub repositories.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/repositories">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {completedAnalyses.length} complete
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Run Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Let AI discover what apps you can build.
              </p>
              <Button size="sm" asChild>
                <Link href="/dashboard/analyses">
                  Start Analysis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>
          </div>
        )}
      </section>

      {/* Recent Repositories */}
      {repositories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Repositories</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/repositories">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.slice(0, 3).map((repo) => (
              <Card key={repo.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">{repo.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
                    {repo.language && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
