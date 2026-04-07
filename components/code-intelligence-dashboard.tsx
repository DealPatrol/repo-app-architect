'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Code2, Zap, Target, BarChart3 } from 'lucide-react'

interface CodeMetrics {
  totalFiles: number
  totalLines: number
  languages: Record<string, number>
  componentCount: number
  reusabilityScore: number
  platforms: string[]
}

interface CodeIntelligenceDashboardProps {
  metrics?: CodeMetrics
}

export function CodeIntelligenceDashboard({ metrics }: CodeIntelligenceDashboardProps) {
  if (!metrics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Run an analysis to see code intelligence metrics</p>
      </Card>
    )
  }

  const topLanguages = Object.entries(metrics.languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Files</p>
              <p className="text-2xl font-bold">{metrics.totalFiles}</p>
            </div>
            <Code2 className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Code Lines</p>
              <p className="text-2xl font-bold">{(metrics.totalLines / 1000).toFixed(1)}k</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Components</p>
              <p className="text-2xl font-bold">{metrics.componentCount}</p>
            </div>
            <Zap className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reusability</p>
              <p className="text-2xl font-bold">{metrics.reusabilityScore}%</p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Platforms</p>
              <p className="text-2xl font-bold">{metrics.platforms.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </Card>
      </div>

      {/* Tech Stack */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Tech Stack Distribution
        </h3>
        <div className="space-y-3">
          {topLanguages.map(([lang, count]) => (
            <div key={lang}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{lang}</span>
                <span className="text-xs text-muted-foreground">{count} files</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground"
                  style={{
                    width: `${(count / metrics.totalFiles) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Platforms Connected */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Connected Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {metrics.platforms.map(platform => (
            <Badge key={platform} variant="secondary">
              {platform}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}
