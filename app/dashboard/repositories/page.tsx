import { getAllRepositories } from '@/lib/queries'
import { RepositoriesList } from '@/components/repositories-list'

export default async function RepositoriesPage() {
  let repositories: any[] = []

  try {
    repositories = await getAllRepositories()
  } catch {
    // Database not available
  }

  return <RepositoriesList repositories={repositories} />
}
