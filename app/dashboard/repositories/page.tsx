import { RepositorySelector } from '@/components/repository-selector'

export default function RepositoriesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discover Your Apps</h1>
          <p className="text-muted-foreground mt-2">
            Select the repositories you want to analyze. App Architect will scan across all your code to discover what applications you can build.
          </p>
        </div>
        <RepositorySelector />
      </div>
    </div>
  )
}
