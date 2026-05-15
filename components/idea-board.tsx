'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Search,
  RefreshCw,
  LayoutGrid,
} from 'lucide-react'
import type { Analysis } from '@/lib/queries'

type StatusFilter = 'all' | Analysis['status']

type IconComponent = (props: { className?: string }) => JSX.Element

const STATUS_META: Record<
  Analysis['status'],
  { label: string; color: string; badgeClass: string; icon: IconComponent }
> = {
  pending: {
    label: 'Pending',
    color: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  scanning: {
    label: 'Scanning',
    color: 'text-chart-1',
    badgeClass: 'bg-chart-1/10 text-chart-1',
    icon: Loader2,
  },
  analyzing: {
    label: 'Analyzing',
    color: 'text-chart-2',
    badgeClass: 'bg-chart-2/10 text-chart-2',
    icon: Sparkles,
  },
  complete: {
    label: 'Complete',
    color: 'text-chart-1',
    badgeClass: 'bg-chart-1/10 text-chart-1',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive',
    icon: XCircle,
  },
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'complete', label: 'Complete' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'scanning', label: 'Scanning' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
]

function AnalysisCard({ analysis }: { analysis: Analysis }) {
  const meta = STATUS_META[analysis.status]
  const StatusIcon = meta.icon
  const progress =
    analysis.total_files > 0
      ? Math.round((analysis.analyzed_files / analysis.total_files) * 100)
      : 0

  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200 hover:border-border flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{analysis.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(analysis.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Badge className={`text-xs shrink-0 ${meta.badgeClass}`}>
          <StatusIcon
            className={`h-3 w-3 mr-1 ${analysis.status === 'scanning' ? 'animate-spin' : analysis.status === 'analyzing' ? 'animate-pulse' : ''}`}
          />
          {meta.label}
        </Badge>
      </div>

      {analysis.total_files > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{analysis.analyzed_files} / {analysis.total_files} files</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-1 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {analysis.error_message && (
        <p className="text-xs text-destructive line-clamp-2">{analysis.error_message}</p>
      )}

      <Button variant="outline" size="sm" asChild className="self-start mt-auto">
        <Link href={`/dashboard/analyses/${analysis.id}`}>
          View Results
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Link>
      </Button>
    </Card>
  )
}

export function IdeaBoard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalyses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyses')
      if (!res.ok) throw new Error('Failed to load analyses')
      const data: Analysis[] = await res.json()
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analyses')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const filtered = analyses.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const counts = analyses.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="h-5 w-5 text-chart-2" />
            <h1 className="text-2xl font-bold text-foreground">Idea Board</h1>
          </div>
          <p className="text-muted-foreground">All your analyses at a glance — track progress and review results.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAnalyses(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      {!loading && analyses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(Object.keys(STATUS_META) as Analysis['status'][]).map((status) => {
            const meta = STATUS_META[status]
            const count = counts[status] || 0
            if (count === 0) return null
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  statusFilter === status
                    ? 'border-foreground/30 bg-foreground/5'
                    : 'border-border hover:border-border/80 hover:bg-muted/40'
                }`}
              >
                <p className="text-xl font-bold text-foreground tabular-nums">{count}</p>
                <p className={`text-xs font-medium mt-0.5 ${meta.color}`}>{meta.label}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search analyses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
              {f.value !== 'all' && counts[f.value] != null && (
                <span className="ml-1.5 opacity-70">{counts[f.value]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card className="p-8 text-center border-destructive/30">
          <XCircle className="mx-auto h-10 w-10 text-destructive/50 mb-3" />
          <p className="font-medium text-foreground mb-1">Failed to load analyses</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchAnalyses()}>
            Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card className="border-dashed p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {analyses.length === 0 ? 'No analyses yet' : 'No matches'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {analyses.length === 0
              ? 'Run your first analysis to see it appear here.'
              : 'Try adjusting your search or filter.'}
          </p>
          {analyses.length === 0 && (
            <Button asChild>
              <Link href="/dashboard/analyses">
                <Sparkles className="h-4 w-4 mr-2" />
                Go to Analyses
              </Link>
            </Button>
          )}
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      )}
    </div>
  )
}
