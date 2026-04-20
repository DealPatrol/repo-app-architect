import { getAllAnalyses, getAllRepositories, type Analysis, type Repository } from '@/lib/queries'
import { AnalysesList } from '@/components/analyses-list'

export default async function AnalysesPage() {
  let analyses: Analysis[] = []
  let repositories: Repository[] = []

  try {
    analyses = await getAllAnalyses()
    repositories = await getAllRepositories()
  } catch {
    // Database not available
  }

  return <AnalysesList analyses={analyses} repositories={repositories} />
}
