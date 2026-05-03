import { getDb } from '@/lib/db'
import { Card } from '@/components/ui/card'
import { DemandBadge } from '@/components/demand-badge'
import { TrendingUp, Flame } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getTopDemandApps() {
  const sql = getDb()
  try {
    const results = await sql`
      SELECT * FROM app_demand_signals 
      ORDER BY demand_score DESC 
      LIMIT 15
    `
    return results
  } catch (error) {
    console.error('[v0] Error fetching demand signals:', error)
    return []
  }
}

export default async function DemandInsightsPage() {
  const apps = await getTopDemandApps()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Market Demand Insights</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-2">What people actually want to build</h2>
            <p className="text-muted-foreground">
              Based on discussions across r/webdev, r/SideProject, r/learnprogramming, and more. Updated daily.
            </p>
          </div>

          {apps.length === 0 ? (
            <Card className="p-12 text-center">
              <Flame className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Demand data is being collected. Check back soon.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {apps.map((app: any, idx) => (
                <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold capitalize">{app.app_type.replace(/-/g, ' ')}</h3>
                        <DemandBadge demandScore={app.demand_score} />
                      </div>

                      <div className="space-y-3">
                        {app.trending_keywords && app.trending_keywords.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Trending keywords:</p>
                            <div className="flex flex-wrap gap-2">
                              {app.trending_keywords.slice(0, 5).map((keyword: string) => (
                                <span
                                  key={keyword}
                                  className="inline-block px-3 py-1 rounded-full bg-muted text-xs font-medium"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {app.pain_points && app.pain_points.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">What people need:</p>
                            <ul className="space-y-1">
                              {app.pain_points.slice(0, 3).map((point: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground line-clamp-1">
                                  &quot;{point}&quot;
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-chart-1">{app.demand_score}</div>
                      <p className="text-xs text-muted-foreground">demand score</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Card className="p-6 bg-muted/30">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-chart-1 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">How this helps you</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>See which app ideas have real market demand</li>
                  <li>Understand what features developers are asking for</li>
                  <li>Identify gaps between your blueprints and market needs</li>
                  <li>Prioritize which apps to build based on actual interest</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
