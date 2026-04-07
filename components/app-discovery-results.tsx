'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Zap, Download, Github, Code2, Loader2 } from 'lucide-react'

export interface DiscoveredApp {
  name: string
  description: string
  reusability: number
  missingFiles: string[]
  existingFiles: string[]
  category: 'ready' | 'quick-win' | 'concept'
  estimatedBuildTime: string
  technologies: string[]
}

interface AppDiscoveryResultsProps {
  apps: DiscoveredApp[]
  isLoading?: boolean
  onGenerateScaffold?: (app: DiscoveredApp) => void
}

export function AppDiscoveryResults({
  apps,
  isLoading = false,
  onGenerateScaffold,
}: AppDiscoveryResultsProps) {
  const readyApps = apps.filter(a => a.category === 'ready')
  const quickWins = apps.filter(a => a.category === 'quick-win')
  const concepts = apps.filter(a => a.category === 'concept')

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
          <span className="text-muted-foreground">Analyzing your code...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Ready to Build */}
          {readyApps.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="text-2xl font-bold text-foreground">Ready to Build</h2>
                <Badge variant="default">{readyApps.length} apps</Badge>
              </div>
              <div className="grid gap-4">
                {readyApps.map(app => (
                  <AppCard key={app.name} app={app} onGenerate={onGenerateScaffold} />
                ))}
              </div>
            </section>
          )}

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground">Quick Wins</h2>
                <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400">{quickWins.length} apps</Badge>
              </div>
              <div className="grid gap-4">
                {quickWins.map(app => (
                  <AppCard key={app.name} app={app} onGenerate={onGenerateScaffold} />
                ))}
              </div>
            </section>
          )}

          {/* Concepts */}
          {concepts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-bold text-foreground">Concepts</h2>
                <Badge variant="outline" className="bg-blue-900/20 text-blue-400">{concepts.length} ideas</Badge>
              </div>
              <div className="grid gap-4">
                {concepts.map(app => (
                  <AppCard key={app.name} app={app} onGenerate={onGenerateScaffold} />
                ))}
              </div>
            </section>
          )}

          {apps.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No apps discovered. Try connecting more repositories.</p>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function AppCard({
  app,
  onGenerate,
}: {
  app: DiscoveredApp
  onGenerate?: (app: DiscoveredApp) => void
}) {
  const getBgColor = () => {
    if (app.category === 'ready') return 'border-green-900/30'
    if (app.category === 'quick-win') return 'border-yellow-900/30'
    return 'border-blue-900/30'
  }

  const getIconColor = () => {
    if (app.category === 'ready') return 'text-green-500'
    if (app.category === 'quick-win') return 'text-yellow-500'
    return 'text-blue-500'
  }

  return (
    <Card className={`p-6 ${getBgColor()}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{app.name}</h3>
            {app.category === 'ready' && (
              <Badge className="bg-green-900/30 text-green-400">Ready</Badge>
            )}
            {app.category === 'quick-win' && (
              <Badge className="bg-yellow-900/30 text-yellow-400">Quick Win</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
        </div>
        <Zap className={`h-6 w-6 ${getIconColor()} flex-shrink-0`} />
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Code Reusable</p>
          <p className="text-sm font-medium text-foreground">{app.reusability}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
          <p className="text-sm font-medium text-foreground">{app.estimatedBuildTime}</p>
        </div>
      </div>

      {app.technologies.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {app.technologies.slice(0, 4).map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {app.missingFiles.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-2">Missing Files ({app.missingFiles.length}):</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {app.missingFiles.slice(0, 3).map(file => (
              <li key={file}>• {file}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-border">
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Blueprint
        </Button>
        <Button size="sm" onClick={() => onGenerate?.(app)}>
          <Github className="h-4 w-4 mr-2" />
          Create Repo
        </Button>
      </div>
    </Card>
  )
}
