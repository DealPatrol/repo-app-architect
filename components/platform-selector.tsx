'use client'

import { useState } from 'react'
import { PLATFORMS } from '@/lib/platform-config'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Zap, GitBranch, CheckCircle2, type LucideIcon } from 'lucide-react'

const platformIcons: Record<string, LucideIcon> = {
  github: Github,
  vercel: Zap,
  gitlab: GitBranch,
  bitbucket: GitBranch,
}

export function PlatformSelector() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set())
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = (platformId: string) => {
    const platform = Object.values(PLATFORMS).find(p => p.id === platformId)
    if (!platform) return

    setConnecting(platformId)
    
    const clientId = process.env[`NEXT_PUBLIC_${platformId.toUpperCase()}_CLIENT_ID`]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!clientId || !appUrl) {
      alert(`${platform.name} is not configured yet`)
      setConnecting(null)
      return
    }

    const authUrl = new URL(platform.authUrl)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('scope', platform.scopes)
    authUrl.searchParams.set('redirect_uri', `${appUrl}/auth/callback?platform=${platformId}`)
    authUrl.searchParams.set('response_type', 'code')

    window.location.assign(authUrl.toString())
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Connect Your Platforms</h2>
        <p className="text-muted-foreground">
          Connect your code platforms so CodeVault can analyze all your code in one place.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {Object.values(PLATFORMS).map((platform) => {
          const Icon = platformIcons[platform.id]
          const isConnected = connectedPlatforms.has(platform.id)
          const isConnecting = connecting === platform.id

          return (
            <Card key={platform.id} className={`p-6 transition-all ${isConnected ? 'border-green-500/50 bg-green-950/10' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {platform.id === 'github' && 'Git repositories'}
                      {platform.id === 'vercel' && 'Deployed projects'}
                      {platform.id === 'gitlab' && 'GitLab repos'}
                      {platform.id === 'bitbucket' && 'Bitbucket repos'}
                    </p>
                  </div>
                </div>
                {isConnected && (
                  <Badge className="bg-green-900/50 text-green-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>

              <Button
                onClick={() => handleConnect(platform.id)}
                disabled={isConnecting}
                className="w-full"
                variant={isConnected ? 'outline' : 'default'}
              >
                {isConnecting ? 'Connecting...' : isConnected ? 'Reconnect' : `Connect ${platform.name}`}
              </Button>
            </Card>
          )
        })}
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Why connect multiple platforms?</strong> CodeVault scans all your connected platforms to find reusable code patterns and discover applications you can build by combining code from different sources.
        </p>
      </div>
    </div>
  )
}
