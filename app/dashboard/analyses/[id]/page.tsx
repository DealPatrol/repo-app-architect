'use client'

import { useState, useEffect } from 'react'
import { AppSuggestions } from '@/components/app-suggestions'
import { Button } from '@/components/ui/button'
import { Loader2, Play, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

// Map DB AppBlueprint shape → AppSuggestion shape expected by AppSuggestions component
function normalizeBlueprintsToSuggestions(blueprints: any[]) {
  return blueprints.map((bp) => {
    const missingFiles: any[] = Array.isArray(bp.missing_files) ? bp.missing_files : []
    const missingNames = missingFiles.map((f: any) =>
      typeof f === 'string' ? f : f.name || f.path || ''
    )
    return {
      app_name: bp.name || bp.app_name,
      app_type: bp.app_type || 'App',
      description: bp.description || '',
      is_complete: (bp.reuse_percentage ?? 0) >= 80 && missingFiles.length === 0,
      reuse_percentage: bp.reuse_percentage ?? 0,
      missing_files_count: missingFiles.length,
      missing_files: missingNames,
      technologies: bp.technologies || [],
      difficulty_level: bp.complexity || bp.difficulty_level || 'moderate',
      ai_explanation: bp.ai_explanation || '',
      fast_cash_label:
        missingFiles.length <= 2 && (bp.reuse_percentage ?? 0) >= 70
          ? 'QUICK WIN'
          : undefined,
    }
  })
}

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  const runAnalysis = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    setProgress(0)
    setStatusMsg('Starting...')

    try {
      const res = await fetch(`/api/analyses/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Failed to start analysis')
      if (!res.body) throw new Error('No response stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.progress !== undefined) setProgress(data.progress)

            if (data.status === 'scanning') setStatusMsg('Scanning repositories...')
            else if (data.status === 'analyzing') setStatusMsg('Analyzing with Claude AI...')
            else if (data.status === 'complete') {
              setSuggestions(normalizeBlueprintsToSuggestions(data.blueprints || []))
              setHasRun(true)
              setStatusMsg('')
            } else if (data.status === 'failed') {
              throw new Error(data.error || 'Analysis failed')
            }

            if (data.error && data.status !== 'failed') {
              throw new Error(data.error)
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/50" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">App Discovery Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Discover what applications you can build from your repositories.
        </p>
      </div>

      {!hasRun && (
        <Card className="p-8 border-dashed text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze?</h3>
          <p className="text-muted-foreground mb-6">
            Click the button below to start the AI-powered analysis of your repositories.
          </p>
          <Button
            size="lg"
            onClick={runAnalysis}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {statusMsg || 'Analyzing...'}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
          {loading && progress > 0 && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
            </div>
          )}
        </Card>
      )}

      {error && (
        <Card className="p-4 border-red-900/30 bg-red-900/10">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Analysis Error</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {hasRun && suggestions.length > 0 && (
        <AppSuggestions suggestions={suggestions} analysisId={id} />
      )}

      {hasRun && suggestions.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No app blueprints found. Try analyzing more repositories.
          </p>
        </Card>
      )}
    </div>
  )
}
