'use client'

import { useState, useEffect } from 'react'
import { AppDiscoveryResults, DiscoveredApp } from '@/components/app-discovery-results'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  const [apps, setApps] = useState<DiscoveredApp[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get analysis ID from URL params
    const params = new URLSearchParams(window.location.search)
    const analysisId = params.get('id')

    if (analysisId) {
      fetchResults(analysisId)
    }
  }, [])

  const fetchResults = async (analysisId: string) => {
    try {
      const res = await fetch(`/api/analyses/${analysisId}`)
      const data = await res.json()
      setApps(data.apps || [])
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateScaffold = async (app: DiscoveredApp) => {
    try {
      const res = await fetch('/api/generate-scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: app.name,
          description: app.description,
          technologies: app.technologies,
          existingFiles: app.existingFiles,
          missingFiles: app.missingFiles,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Scaffold generated for ${app.name}! Creating repository...`)
        // TODO: Create GitHub repo with scaffold
      }
    } catch (error) {
      console.error('Scaffold generation failed:', error)
      alert('Failed to generate scaffold')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Discovered Applications</h1>
          <p className="text-muted-foreground">
            AI found {apps.length} applications you can build from your code
          </p>
        </div>
      </div>

      <AppDiscoveryResults apps={apps} isLoading={isLoading} onGenerateScaffold={handleGenerateScaffold} />
    </div>
  )
}
