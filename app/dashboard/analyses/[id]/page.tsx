import { notFound } from 'next/navigation'
import { getAnalysisById, getRepositoriesForAnalysis, getBlueprintsByAnalysis } from '@/lib/queries'
import { AnalysisDetail } from '@/components/analysis-detail'

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let analysis, repositories, blueprints

  try {
    analysis = await getAnalysisById(id)
    if (!analysis) notFound()

    repositories = await getRepositoriesForAnalysis(id)
    blueprints = await getBlueprintsByAnalysis(id)
  } catch {
    notFound()
  }

  return (
    <AnalysisDetail
      analysis={analysis!}
      repositories={repositories ?? []}
      blueprints={blueprints ?? []}
    />
  )
}

