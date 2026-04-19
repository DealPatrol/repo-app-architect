import { RepoPicker } from '@/components/repo-picker'

export default function RepositoriesPage() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Select Repositories</h1>
        <p className="text-muted-foreground">
          Choose which GitHub repositories to analyze for discovering buildable applications.
        </p>
      </div>
      <RepoPicker />
    </div>
  )
}
