import { getAllRepositories, getAllAnalyses, getGapSummary, type Analysis, type Repository } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FolderGit2, Sparkles, Code2, Plus, ArrowRight, Zap, AlertCircle, Lightbulb, Crown } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let repositories: Repository[] = []
  let analyses: Analysis[] = []
  let gapSummary = { total_gaps: 0, blocking_gaps: 0, total_hours: 0, completed_count: 0, by_category: {} }

  try {
    repositories = await getAllRepositories()
    analyses = await getAllAnalyses()
    gapSummary = await getGapSummary()
  } catch {
    // Database not available yet
  }

  const completedAnalyses = analyses.filter((analysis) => analysis.status === 'complete')

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
        <p className="text-cyan-200/60 text-lg">Your code intelligence overview</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="group p-6 bg-black/60 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono tracking-widest text-cyan-400/60 uppercase">Repositories</p>
              <p className="text-3xl font-black text-white mt-1 tabular-nums">{repositories.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FolderGit2 className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </Card>
        <Card className="group p-6 bg-black/60 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono tracking-widest text-orange-400/60 uppercase">Analyses Run</p>
              <p className="text-3xl font-black text-white mt-1 tabular-nums">{analyses.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </Card>
        <Card className="group p-6 bg-black/60 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono tracking-widest text-yellow-400/60 uppercase">Completed</p>
              <p className="text-3xl font-black text-white mt-1 tabular-nums">{completedAnalyses.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Code2 className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <section className="space-y-5">
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
        
        {repositories.length === 0 ? (
          <Card className="border-dashed border-2 border-cyan-500/30 bg-black/40 p-10 text-center">
            <div className="h-16 w-16 rounded-2xl bg-cyan-950/50 flex items-center justify-center mx-auto mb-4">
              <FolderGit2 className="h-8 w-8 text-cyan-400/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect your first repository</h3>
            <p className="text-sm text-cyan-200/60 mb-6 max-w-md mx-auto">
              Start by adding your GitHub repositories. We&apos;ll scan all files and prepare them for AI analysis.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold" asChild>
              <Link href="/dashboard/repositories">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group p-6 bg-black/60 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FolderGit2 className="h-6 w-6 text-cyan-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-cyan-400/60 bg-cyan-950/50 px-2.5 py-1 rounded-full uppercase">
                  {repositories.length} connected
                </span>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Repositories</h3>
              <p className="text-sm text-cyan-200/60 mb-5">
                Manage your connected GitHub repositories and add new ones.
              </p>
              <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30 hover:border-cyan-400" asChild>
                <Link href="/dashboard/repositories">
                  Manage Repos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>

            <Card className="group p-6 bg-black/60 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-orange-400/60 bg-orange-950/50 px-2.5 py-1 rounded-full uppercase">
                  {completedAnalyses.length} complete
                </span>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Run Analysis</h3>
              <p className="text-sm text-cyan-200/60 mb-5">
                Let AI discover what apps you can build from your existing code.
              </p>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-black font-bold" asChild>
                <Link href="/dashboard/analyses">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Analysis
                </Link>
              </Button>
            </Card>

            <Card className="group p-6 bg-black/60 border-yellow-500/30 backdrop-blur-sm hover:border-yellow-400/50 transition-all duration-300">
              <div className="flex items-start justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="h-6 w-6 text-yellow-400" />
                </div>
                <span className="text-xs font-mono tracking-widest text-yellow-400/60 bg-yellow-950/50 px-2.5 py-1 rounded-full uppercase">
                  Quick ideas
                </span>
              </div>
              <h3 className="font-bold text-lg text-white mb-1">Template Hub</h3>
              <p className="text-sm text-cyan-200/60 mb-5">
                Pre-configured combinations you can assemble into products today.
              </p>
              <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-950/30 hover:border-yellow-400" asChild>
                <Link href="/dashboard/templates/browse">
                  Explore Templates
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>

            {gapSummary.total_gaps > 0 && (
              <Card className="group p-6 bg-red-950/20 border-red-500/30 backdrop-blur-sm hover:border-red-400/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <span className="text-xs font-mono tracking-widest text-red-400/80 bg-red-950/50 px-2.5 py-1 rounded-full uppercase">
                    {gapSummary.total_gaps} open
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white mb-1">Missing Code</h3>
                <p className="text-sm text-cyan-200/60 mb-5">
                  {Math.round(gapSummary.total_hours)} hours of features ready to build
                </p>
                <Button size="sm" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold" asChild>
                  <Link href="/dashboard/gaps">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Link>
                </Button>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Recent Repositories */}
      {repositories.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Repositories</h2>
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30" asChild>
              <Link href="/dashboard/repositories">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.slice(0, 6).map((repo) => (
              <Card key={repo.id} className="group p-5 bg-black/60 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-950/50 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-950/70 transition-colors">
                    <FolderGit2 className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white truncate">{repo.name}</h3>
                    <p className="text-xs text-cyan-400/60 truncate mt-0.5">{repo.full_name}</p>
                    {repo.language && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 font-mono">
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

      {/* Upgrade CTA */}
      <Card className="p-6 bg-gradient-to-r from-yellow-950/30 via-orange-950/20 to-yellow-950/30 border-yellow-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Upgrade to Pro</h3>
              <p className="text-sm text-cyan-200/60">Unlock unlimited analyses, blueprints, and more</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold" asChild>
            <Link href="/pricing">
              View Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
