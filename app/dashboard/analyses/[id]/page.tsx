import { getAnalysisById, getRepositoriesForAnalysis, getBlueprintsByAnalysis } from '@/lib/queries'
import { AnalysisDetail } from '@/components/analysis-detail'
import { notFound } from 'next/navigation'

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const analysis = await getAnalysisById(id)
  
  if (!analysis) {
    notFound()
  }

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
}
