'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Code2, FileText, Zap, AlertCircle, Github, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface AppSuggestion {
  app_name: string
  app_type: string
  description: string
  is_complete: boolean
  reuse_percentage: number
  missing_files_count: number
  missing_files: string[]
  technologies: string[]
  difficulty_level: string
  ai_explanation: string
  fast_cash_label?: string
}

interface AppSuggestionsProps {
  suggestions: AppSuggestion[]
  analysisId: string
}

export function AppSuggestions({ suggestions, analysisId }: AppSuggestionsProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [creatingRepoFor, setCreatingRepoFor] = useState<string | null>(null)
  const [repoName, setRepoName] = useState('')
  const [repoLoading, setRepoLoading] = useState(false)

  const completeSuggestions = suggestions.filter(s => s.is_complete)
  const partialSuggestions = suggestions.filter(s => !s.is_complete)

  const handleDownloadBlueprint = async (app: AppSuggestion) => {
    setDownloadingId(app.app_name)
    try {
      const res = await fetch('/api/export/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app, analysisId }),
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${app.app_name.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`
      a.click()
    } catch {
      alert('Failed to download blueprint')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDownloadPDF = async (app: AppSuggestion) => {
    setDownloadingId(app.app_name)
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app, analysisId }),
      })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${app.app_name.toLowerCase().replace(/\s+/g, '-')}-report.pdf`
      a.click()
    } catch {
      alert('Failed to download PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleCreateRepository = async (app: AppSuggestion) => {
    if (!repoName.trim()) {
      alert('Please enter a repository name')
      return
    }

    setRepoLoading(true)
    try {
      const res = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app, repoName: repoName.trim() }),
      })

      if (!res.ok) throw new Error('Failed to create repository')
      const data = await res.json()

      setCreatingRepoFor(null)
      setRepoName('')
      window.open(data.repository.url, '_blank')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create repository')
    } finally {
      setRepoLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Apps Discovered</p>
          <p className="text-3xl font-bold text-foreground">{suggestions.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Immediately Buildable</p>
          <p className="text-3xl font-bold text-green-400">{completeSuggestions.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Quick Wins (2-3 files)</p>
          <p className="text-3xl font-bold text-yellow-400">
            {partialSuggestions.filter(s => s.missing_files_count <= 3).length}
          </p>
        </Card>
      </div>

      {/* Complete Apps */}
      {completeSuggestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold text-foreground">Ready to Build</h2>
            <Badge className="bg-green-900/30 text-green-400 border-green-700">
              {completeSuggestions.length} apps
            </Badge>
          </div>

          <div className="grid gap-4">
            {completeSuggestions.map((app) => (
              <Card key={app.app_name} className="p-6 border-green-900/30 hover:border-green-700 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{app.app_name}</h3>
                      <Badge className="bg-green-900/30 text-green-400">Complete</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                  <Code2 className="h-6 w-6 text-green-400/50 flex-shrink-0" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <p className="text-sm font-medium text-foreground">{app.app_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reusable Code</p>
                    <p className="text-sm font-medium text-green-400">{app.reuse_percentage}%</p>
                  </div>
                </div>

                {app.technologies.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {app.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadBlueprint(app)}
                    disabled={downloadingId === app.app_name}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Blueprint
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(app)}
                    disabled={downloadingId === app.app_name}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCreatingRepoFor(app.app_name)}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    New Repo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Partial Apps (Quick Wins) */}
      {partialSuggestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-foreground">Quick Wins</h2>
            <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700">
              {partialSuggestions.filter(s => s.missing_files_count <= 3).length} apps
            </Badge>
          </div>

          <div className="grid gap-4">
            {partialSuggestions.map((app) => (
              <Card key={app.app_name} className="p-6 border-yellow-900/30 hover:border-yellow-700 transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{app.app_name}</h3>
                      {app.fast_cash_label && (
                        <Badge className="bg-yellow-900/30 text-yellow-400">{app.fast_cash_label}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                  <Code2 className="h-6 w-6 text-yellow-400/50 flex-shrink-0" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Missing Files</p>
                    <p className="text-sm font-medium text-yellow-400">{app.missing_files_count} files</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reusable Code</p>
                    <p className="text-sm font-medium text-foreground">{app.reuse_percentage}%</p>
                  </div>
                </div>

                {app.missing_files.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-900/10 border border-yellow-900/20">
                    <p className="text-xs text-yellow-400 font-medium mb-2">Missing to complete:</p>
                    <ul className="text-xs text-yellow-400/80 space-y-1">
                      {app.missing_files.slice(0, 3).map((file) => (
                        <li key={file}>• {file}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadBlueprint(app)}
                    disabled={downloadingId === app.app_name}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Blueprint
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(app)}
                    disabled={downloadingId === app.app_name}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCreatingRepoFor(app.app_name)}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    New Repo
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Create Repository Dialog */}
      <Dialog open={creatingRepoFor !== null} onOpenChange={(open) => !open && setCreatingRepoFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repository</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Repository Name</label>
              <Input
                placeholder="my-new-app"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be the name of your GitHub repository
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatingRepoFor(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const app = suggestions.find(s => s.app_name === creatingRepoFor)
                if (app) handleCreateRepository(app)
              }}
              disabled={repoLoading}
            >
              {repoLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  Create Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
