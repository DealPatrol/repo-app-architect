import { Suspense } from 'react'
import { RepositoriesList } from '@/components/repositories-list'
import { getAllRepositories, type Repository } from '@/lib/queries'

export const dynamic = 'force-dynamic'

function RepositoriesFallback() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-white">Repositories</h1>
        <p className="text-cyan-200/60">Loading your repository workspace...</p>
      </div>
    </div>
  )
}

export default async function RepositoriesPage() {
  let repositories: Repository[] = []

  try {
    repositories = await getAllRepositories()
  } catch {
    // Database not available yet
  }

  return (
    <Suspense fallback={<RepositoriesFallback />}>
      <RepositoriesList repositories={repositories} />
    </Suspense>
  )
}
