import { notFound } from 'next/navigation'
import { getAnalysisById, getRepositoriesForAnalysis, getBlueprintsByAnalysis } from '@/lib/queries'
import { AnalysisDetail } from '@/components/analysis-detail'

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const analysis = await getAnalysisById(id)
    if (!analysis) notFound()

    const [repositories, blueprints] = await Promise.all([
      getRepositoriesForAnalysis(id),
      getBlueprintsByAnalysis(id),
    ])

    return (
      <AnalysisDetail
        analysis={analysis}
        repositories={repositories}
        blueprints={blueprints}
      />
    )
  } catch {
    notFound()
  }
}

