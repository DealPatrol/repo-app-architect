'use client'

import { useState, useEffect } from 'react'
import { AppSuggestions } from '@/components/app-suggestions'
import { Button } from '@/components/ui/button'
import { Loader2, Play, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  const runAnalysis = async () => {
    if (!id) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analyses/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id }),
      })

      if (!res.ok) throw new Error('Failed to run analysis')
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setHasRun(true)
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
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Analysis
              </>
            )}
          </Button>
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
            No app suggestions found. Try analyzing more repositories.
          </p>
        </Card>
      )}
    </div>
  )
}
