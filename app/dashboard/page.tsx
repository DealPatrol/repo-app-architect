'use client'

import { PlatformSelector } from '@/components/platform-selector'
import { Card } from '@/components/ui/card'
import { Zap, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground text-balance">CodeVault Dashboard</h1>
        <p className="text-muted-foreground">Connect your code platforms and let AI discover what applications you can build from your existing code.</p>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 border-border/50">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Multi-Platform Connect</h3>
              <p className="text-sm text-muted-foreground">
                Connect GitHub, Vercel, Replit, GitLab, and Netlify to scan all your code in one place.
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
              <h3 className="font-semibold text-foreground mb-1">AI Discovers Apps</h3>
              <p className="text-sm text-muted-foreground">
                Claude AI analyzes cross-platform code to find reusable patterns and buildable applications.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Selector */}
      <PlatformSelector />
    </div>
  )
}
