import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Sparkles, Code2, Layers, ArrowRight, AlertCircle } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  auth_required: 'You must sign in to access the dashboard.',
  github_oauth_not_configured: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables.',
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'An unexpected error occurred.' : null

  return (
    <div className="min-h-screen bg-background">
      {errorMessage && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center gap-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Layers className="h-5 w-5 text-background" />
            </div>
            <span className="font-semibold text-lg">CodeVault</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-4 w-4 mr-2" />
                Sign in with GitHub
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            AI-Powered Code Analysis
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Discover Apps Hidden in Your Code
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Connect your GitHub repositories and let AI analyze your codebase to discover 
            what applications you can build by combining existing files and components.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/api/auth/github/login">
                Sign in with GitHub
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard/repositories">
                Open Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Github className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Connect Repositories</h3>
            <p className="text-muted-foreground text-sm">
              Link your GitHub repos and we will scan all files to understand your codebase structure.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Our AI analyzes each file to identify its purpose, exports, and reusability potential.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">App Blueprints</h3>
            <p className="text-muted-foreground text-sm">
              Get detailed blueprints showing what apps you can build and what files you need to add.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Add Your Repositories</h3>
                <p className="text-muted-foreground">
                  Enter your GitHub repository URLs or connect via OAuth to import multiple repos at once.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Scans Your Code</h3>
                <p className="text-muted-foreground">
                  Our AI examines every file - components, utilities, hooks, APIs - identifying what each piece does and how reusable it is.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Discover App Possibilities</h3>
                <p className="text-muted-foreground">
                  See a list of applications you can build using your existing code. Each blueprint shows which files to reuse and what few extras you might need.
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
              <Layers className="h-4 w-4" />
              <span>CodeVault</span>
            </div>
            <p>Built with Next.js and Vercel AI SDK</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
