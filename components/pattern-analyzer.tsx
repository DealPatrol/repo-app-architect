'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Cpu,
  Sparkles,
  Loader2,
  Lightbulb,
  Clock,
  TrendingUp,
  Zap,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import type { Analysis } from '@/lib/queries'
import type { PatternAnalyzerResult, ProjectSuggestion } from '@/app/api/pattern-analyzer/route'

const DIFFICULTY_META = {
  easy: { label: 'Easy', class: 'bg-chart-1/10 text-chart-1' },
  medium: { label: 'Medium', class: 'bg-chart-2/10 text-chart-2' },
  hard: { label: 'Hard', class: 'bg-destructive/10 text-destructive' },
}

function SuggestionCard({ suggestion }: { suggestion: ProjectSuggestion }) {
  const [expanded, setExpanded] = useState(false)
  const diff = DIFFICULTY_META[suggestion.difficulty] ?? DIFFICULTY_META.medium

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 hover:border-border">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-foreground">{suggestion.name}</h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {suggestion.type}
            </Badge>
          </div>
          <p className="text-sm text-chart-2 font-medium">{suggestion.tagline}</p>
        </div>
        <Badge className={`text-xs shrink-0 ${diff.class}`}>{diff.label}</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{suggestion.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{suggestion.estimatedEffort}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{suggestion.monetizationAngle}</span>
        </div>
      </div>

      {suggestion.suggestedStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {suggestion.suggestedStack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? 'Less detail' : 'More detail'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {suggestion.detectedPatterns.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Inspired by
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {suggestion.detectedPatterns.map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <span className="text-chart-1 mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              Why now
            </p>
            <p className="text-xs text-muted-foreground">{suggestion.whyNow}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

interface PatternAnalyzerProps {
  completedAnalyses: Analysis[]
}

export function PatternAnalyzer({ completedAnalyses }: PatternAnalyzerProps) {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    completedAnalyses[0]?.id ?? '',
  )
  const [result, setResult] = useState<PatternAnalyzerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!selectedAnalysisId) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/pattern-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: selectedAnalysisId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }

      const data: PatternAnalyzerResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const noAnalyses = completedAnalyses.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="h-5 w-5 text-chart-2" />
          <h1 className="text-2xl font-bold text-foreground">Pattern Analyzer</h1>
        </div>
        <p className="text-muted-foreground">
          Scan your analyzed codebase to surface hidden patterns and get AI-generated project suggestions
          tailored to your tech stack.
        </p>
      </div>

      {/* Control panel */}
      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4">Select a completed analysis to scan</h2>

        {noAnalyses ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            No completed analyses yet. Run an analysis first, then come back here.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px] max-w-sm">
              <Select value={selectedAnalysisId} onValueChange={setSelectedAnalysisId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an analysis" />
                </SelectTrigger>
                <SelectContent>
                  {completedAnalyses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScan} disabled={loading || !selectedAnalysisId}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Scan & Suggest
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-6 border-destructive/30">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Scan failed</span>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-8">
          {/* Detected patterns */}
          {result.patterns.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-chart-2" />
                Detected Patterns
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.patterns.map((p) => (
                  <Badge key={p} variant="outline" className="text-sm py-1 px-3">
                    {p}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Top technologies */}
          {result.topTechnologies.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-chart-1" />
                Top Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.topTechnologies.map((t) => (
                  <Badge key={t} className="bg-chart-1/10 text-chart-1 text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Project suggestions */}
          {result.suggestions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-chart-3" />
                <h2 className="text-lg font-semibold text-foreground">Project Suggestions</h2>
                <Badge className="bg-chart-3/10 text-chart-3">
                  {result.suggestions.length} ideas
                </Badge>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {result.suggestions.map((s) => (
                  <SuggestionCard key={s.name} suggestion={s} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
