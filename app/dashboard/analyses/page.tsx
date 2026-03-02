import { getAllAnalyses, getAllRepositories } from '@/lib/queries'
import { AnalysesList } from '@/components/analyses-list'

export default async function AnalysesPage() {
  let analyses: any[] = []
  let repositories: any[] = []

  try {
    analyses = await getAllAnalyses()
    repositories = await getAllRepositories()
  } catch {
    // Database not available
  }

  return <AnalysesList analyses={analyses} repositories={repositories} />
}
