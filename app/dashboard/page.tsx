'use client'

import { RepoPicker } from '@/components/repo-picker'
import { Card } from '@/components/ui/card'
import { FolderGit2, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">Discover Your Apps</h1>
        <p className="text-muted-foreground">Select 2-20 of your GitHub repositories to analyze and discover what applications you can build from your existing code.</p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 border-border/50">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <FolderGit2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">How it works</h3>
              <p className="text-sm text-muted-foreground">
                Pick your repos below, then AI will scan all your files to discover what apps you can build by combining components and utilities.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-border/50">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">What you'll see</h3>
              <p className="text-sm text-muted-foreground">
                Complete applications ready to build, plus "quick wins" that need just 2-3 extra files. Download blueprints or create repos instantly.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Repo Picker */}
      <RepoPicker />
    </div>
  )
}
