import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Layers, Sparkles, Code2, FolderGit2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-foreground flex items-center justify-center">
            <Layers className="h-8 w-8 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">App Architect</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover apps hidden in your code
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="border border-border rounded-xl p-8 space-y-6 bg-card">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Sign in to continue</h2>
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to start analyzing your repositories.
            </p>
          </div>

          <Button asChild size="lg" className="w-full gap-2">
            <Link href="/api/auth/github/login">
              <Github className="h-5 w-5" />
              Continue with GitHub
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground">
            We only request read access to your repositories. Your code never leaves GitHub.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="space-y-2 text-center">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
              <FolderGit2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Connect repos</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">AI analysis</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
              <Code2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">App blueprints</p>
          </div>
        </div>
      </div>
    </div>
  )
}
