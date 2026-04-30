import { getAllRepositories, getAllAnalyses, type Analysis, type Repository } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FolderGit2, Sparkles, Code2, Plus, ArrowRight, Layers } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  let repositories: Repository[] = []
  let analyses: Analysis[] = []

  try {
    repositories = await getAllRepositories()
    analyses = await getAllAnalyses()
  } catch {
    // Database not available yet
  }

  const completedAnalyses = analyses.filter((analysis) => analysis.status === 'complete')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your code intelligence at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 bg-card/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Repositories</p>
              <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{repositories.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderGit2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Analyses</p>
              <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{analyses.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">{completedAnalyses.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      {repositories.length === 0 ? (
        <Card className="border-dashed border-border/60 p-10 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Get started with CodeVault</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Connect your GitHub repositories and let AI discover the products hiding in your code.
          </p>
          <Button asChild>
            <Link href="/dashboard/repositories">
              <Plus className="h-4 w-4 mr-2" />
              Add your first repository
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6 bg-card/60 hover:bg-card/80 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FolderGit2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {repositories.length} connected
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Repositories</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your connected GitHub repositories.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/repositories">
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </Card>

          <Card className="p-6 bg-card/60 hover:bg-card/80 transition-colors group">
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {completedAnalyses.length} complete
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">Run analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover what apps you can build from your code.
            </p>
            <Button size="sm" asChild>
              <Link href="/dashboard/analyses">
                Start analysis
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </Card>
        </div>
      )}

      {/* Recent Repos */}
      {repositories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent repositories</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/dashboard/repositories">View all</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {repositories.slice(0, 6).map((repo) => (
              <Card key={repo.id} className="p-4 bg-card/60 hover:bg-card/80 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground text-sm truncate">{repo.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
                    {repo.language && (
                      <span className="inline-block mt-1.5 text-xs px-1.5 py-0.5 rounded bg-primary/8 text-primary font-medium">
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
