import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GapPriorityMatrix } from '@/components/gap-priority-matrix'
import { MissingFileCard } from '@/components/missing-file-card'
import { getAllMissingGaps, getGapSummary } from '@/lib/queries'
import { groupGapsByPriority, calculateTotalEffort, gapCategories } from '@/lib/gap-priorities'

export const dynamic = 'force-dynamic'

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-secondary rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-secondary rounded-lg" />
        ))}
      </div>
    </div>
  )
}

async function GapsDashboardContent() {
  let gaps: any[] = []
  let summary: any = { total_gaps: 0, blocking_gaps: 0, total_hours: 0, by_category: {}, completed_count: 0 }
  let setupRequired = false

  try {
    [gaps, summary] = await Promise.all([
      getAllMissingGaps(),
      getGapSummary(),
    ])
  } catch (error) {
    console.error('[v0] Failed to fetch gaps:', error)
    setupRequired = true
  }

  if (setupRequired || !gaps.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analyses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Missing Code Dashboard</h1>
            <p className="text-muted-foreground">Strategic view of everything that needs to be built</p>
          </div>
        </div>

        <Card className="p-12 text-center border-2 border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No gaps found yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Run an analysis on your repositories first to discover missing code that needs to be built.
          </p>
          <Button asChild>
            <Link href="/dashboard/analyses">
              Run an Analysis
            </Link>
          </Button>
        </Card>
      </div>
    )
  }

  try {
    ;[gaps, summary] = await Promise.all([
      getAllMissingGaps(),
      getGapSummary(),
    ])
  } catch {
    // Database tables may not exist yet
  }

  const gapsByPriority = groupGapsByPriority(gaps)
  const priorityCounts = {
    critical: gapsByPriority.critical.length,
    high: gapsByPriority.high.length,
    medium: gapsByPriority.medium.length,
    low: gapsByPriority.low.length,
  }

  const categoryGroups = gaps.reduce((acc, gap) => {
    if (!acc[gap.category]) {
      acc[gap.category] = []
    }
    acc[gap.category].push(gap)
    return acc
  }, {} as Record<string, typeof gaps>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/analyses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Missing Code Dashboard</h1>
          <p className="text-muted-foreground">
            Strategic view of everything that needs to be built across all projects
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Total Gaps</p>
              <p className="text-2xl font-bold">{summary.total_gaps}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold mb-1 text-red-700">Critical Gaps</p>
              <p className="text-2xl font-bold text-red-600">{priorityCounts.critical}</p>
              <p className="text-xs text-red-600/70 mt-1">
                Quick wins & blockers
              </p>
            </div>
            <Zap className="w-5 h-5 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-1">Total Effort</p>
              <p className="text-2xl font-bold">{Math.round(summary.total_hours)}h</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(summary.total_hours / 8)} days @ 8h/day
              </p>
            </div>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold mb-1 text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completed_count}</p>
              <p className="text-xs text-green-600/70 mt-1">
                {summary.total_gaps > 0 ? Math.round((summary.completed_count / summary.total_gaps) * 100) : 0}% of targets
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Priority Matrix */}
      <GapPriorityMatrix gaps={gaps} />

      {/* Priority Groups */}
      <div className="space-y-6">
        {Object.entries(priorityCounts)
          .filter(([_, count]) => count > 0)
          .map(([priority, count]) => (
            <div key={priority} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {priority} Priority
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {count} gap{count !== 1 ? 's' : ''} • {' '}
                  {Math.round(
                    calculateTotalEffort(
                      gapsByPriority[priority as keyof typeof gapsByPriority]
                    )
                  )}
                  h effort
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {gapsByPriority[priority as keyof typeof gapsByPriority].map(gap => (
                  <MissingFileCard
                    key={gap.id}
                    gap={gap}
                    allGaps={gaps}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryGroups).length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border/50">
          <h2 className="text-lg font-semibold">By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryGroups).map(([category, categoryGaps]) => {
              const cat = gapCategories[category] || gapCategories.other
              const gaps_array = categoryGaps as any[]
              return (
                <Card key={category} className="p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {cat.name}
                      </p>
                      <p className="text-lg font-bold">
                        {gaps_array.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(calculateTotalEffort(gaps_array))}h
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GapsDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <GapsDashboardContent />
      </Suspense>
    </div>
  )
}
