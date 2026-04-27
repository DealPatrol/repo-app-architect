'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, Plus, Loader2, CheckCircle2, XCircle, Clock, ArrowRight, FolderGit2 } from 'lucide-react'
import type { Analysis, Repository } from '@/lib/queries'

interface AnalysesListProps {
  analyses: Analysis[]
  repositories: Repository[]
}

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', className: 'text-muted-foreground' },
  scanning: { icon: Loader2, label: 'Scanning', className: 'text-chart-1 animate-spin' },
  analyzing: { icon: Sparkles, label: 'Analyzing', className: 'text-chart-1 animate-pulse' },
  complete: { icon: CheckCircle2, label: 'Complete', className: 'text-chart-1' },
  failed: { icon: XCircle, label: 'Failed', className: 'text-destructive' },
}

export function AnalysesList({ analyses, repositories }: AnalysesListProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleCreateAnalysis = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this analysis')
      return
    }
    if (selectedRepos.length === 0) {
      setError('Please select at least one repository')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), repositoryIds: selectedRepos }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create analysis')
      }

      const analysis = await res.json()
      setName('')
      setSelectedRepos([])
      setIsOpen(false)
      router.refresh()
      router.push(`/dashboard/analyses/${analysis.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRepo = (id: string) => {
    setSelectedRepos(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const allRepoIds = useMemo(() => repositories.map((r) => r.id), [repositories])
  const allReposSelected = useMemo(
    () => allRepoIds.length > 0 && allRepoIds.every((id) => selectedRepos.includes(id)),
    [allRepoIds, selectedRepos],
  )

  const selectAllRepos = () => {
    setSelectedRepos([...allRepoIds])
  }

  const clearRepoSelection = () => {
    setSelectedRepos([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyses</h1>
          <p className="text-muted-foreground">Run AI analysis to discover app possibilities.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button disabled={repositories.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Analysis</DialogTitle>
              <DialogDescription>
                Select repositories to analyze and discover what apps you can build.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="analysis-name">Analysis Name</Label>
                <Input
                  id="analysis-name"
                  placeholder="e.g., Full codebase analysis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="shrink-0">Select Repositories</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllRepos}
                      disabled={
                        isLoading ||
                        repositories.length === 0 ||
                        allReposSelected
                      }
                    >
                      Select all
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearRepoSelection}
                      disabled={isLoading || selectedRepos.length === 0}
                    >
                      Clear selection
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                  {repositories.map((repo) => (
                    <label
                      key={repo.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedRepos.includes(repo.id)}
                        onCheckedChange={() => toggleRepo(repo.id)}
                        disabled={isLoading}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground">{repo.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
                      </div>
                      {repo.language && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {repo.language}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnalysis} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* No repositories message */}
      {repositories.length === 0 && (
        <Card className="border-dashed p-12 text-center">
          <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Add repositories first</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You need to connect at least one GitHub repository before running an analysis.
          </p>
          <Button asChild>
            <Link href="/dashboard/repositories">
              <Plus className="h-4 w-4 mr-2" />
              Add Repository
            </Link>
          </Button>
        </Card>
      )}

      {/* Analyses List */}
      {repositories.length > 0 && analyses.length === 0 && (
        <Card className="border-dashed p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Run your first analysis to discover what applications you can build from your code.
          </p>
          <Button onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Start Your First Analysis
          </Button>
        </Card>
      )}

      {analyses.length > 0 && (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const status = statusConfig[analysis.status]
            const StatusIcon = status.icon
            return (
              <Card key={analysis.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{analysis.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className={`flex items-center gap-1 ${status.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                        {analysis.total_files > 0 && (
                          <span>
                            {analysis.analyzed_files}/{analysis.total_files} files
                          </span>
                        )}
                        <span>
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/analyses/${analysis.id}`}>
                      View Results
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
