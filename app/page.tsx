import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Sparkles, Code2, Layers, ArrowRight, Zap, GitBranch } from 'lucide-react'

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export default function HomePage() {
  const getGitHubAuthUrl = () => {
    if (!GITHUB_CLIENT_ID || !APP_URL) return '#'
    return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${APP_URL}/api/auth/github/callback`
  }

  const authUrl = getGitHubAuthUrl()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Zap className="h-5 w-5 text-background" />
            </div>
            <span className="font-semibold text-lg">CodeVault</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button variant="outline" size="sm" asChild>
              <a href={authUrl}>
                <Github className="h-4 w-4 mr-2" />
                Sign In
              </a>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Multi-Platform Code Intelligence
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Ship 5 Apps in 7 Days
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Connect all your code platforms. Let AI discover which applications you can build from your existing code. Get ready-to-run scaffolds and ship immediately.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <a href={authUrl}>
                <Github className="h-4 w-4 mr-2" />
                Sign In with GitHub
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {/* Platform Icons */}
          <div className="flex items-center justify-center gap-4 pt-8">
            <div className="text-xs text-muted-foreground">Supported platforms:</div>
            <div className="flex gap-3">
              <div className="p-2 rounded-lg bg-card border border-border">
                <Github className="h-4 w-4" />
              </div>
              <div className="p-2 rounded-lg bg-card border border-border">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="p-2 rounded-lg bg-card border border-border">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="p-2 rounded-lg bg-card border border-border">
                <Zap className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Multi-Platform Connect</h3>
            <p className="text-muted-foreground text-sm">
              Connect GitHub, Vercel, Replit, GitLab, and Netlify. CodeVault scans all your code in one place.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Pattern Detection</h3>
            <p className="text-muted-foreground text-sm">
              Claude AI analyzes cross-platform code to find reusable patterns, architecture, and buildable apps.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Auto Scaffolding</h3>
            <p className="text-muted-foreground text-sm">
              Generate complete project scaffolds with missing files auto-created by AI. Ship production-ready code.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How CodeVault Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Connect Your Platforms</h3>
                <p className="text-muted-foreground">
                  One-click OAuth to connect GitHub, Vercel, Replit, GitLab, Netlify. CodeVault gets read access to scan your code.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Analyzes Everything</h3>
                <p className="text-muted-foreground">
                  Claude AI scans 1000+ files across all platforms, detects patterns, identifies reusable components, and finds gaps in functionality.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Discover Apps You Can Build</h3>
                <p className="text-muted-foreground">
                  See all possible applications sorted by build time. Ready-to-build apps (100% code exists), Quick Wins (80%+), and Concepts (patterns detected).
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Ship in Days</h3>
                <p className="text-muted-foreground">
                  AI generates missing files, creates GitHub repos with complete scaffolds, and you deploy production-ready code immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>CodeVault</span>
            </div>
            <p>Built with Next.js, Claude AI, and Vercel</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
