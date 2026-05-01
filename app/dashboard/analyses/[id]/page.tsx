import { notFound } from 'next/navigation'
import { AnalysisDetail } from '@/components/analysis-detail'
import {
  getAnalysisById,
  getBlueprintsByAnalysis,
  getRepositoriesForAnalysis,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let analysis = null
  let repositories = []
  let blueprints = []

  try {
    ;[analysis, repositories, blueprints] = await Promise.all([
      getAnalysisById(id),
      getRepositoriesForAnalysis(id),
      getBlueprintsByAnalysis(id),
    ])
  } catch {
    notFound()
  }

  if (!analysis) {
    notFound()
  }

  return (
    <AnalysisDetail
      analysis={analysis}
      repositories={repositories}
      blueprints={blueprints}
    />
  )
}
