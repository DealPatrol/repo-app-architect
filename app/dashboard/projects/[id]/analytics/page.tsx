import { AnalyticsDashboard } from '@/components/analytics-dashboard'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnalyticsPage({ params }: Props) {
  const { id: projectId } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">Project performance and team insights</p>
      </div>

      <AnalyticsDashboard projectId={projectId} />
    </div>
  )
}
