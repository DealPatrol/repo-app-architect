import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Testimonials } from '@/components/testimonials'
import { ImpactStats } from '@/components/impact-stats'
import { Github, Sparkles, Code2, Layers, ArrowRight, AlertCircle, Shield, Zap, GitBranch, Check } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  auth_required: 'You must sign in to access the dashboard.',
  github_oauth_not_configured: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your environment variables.',
  invalid_oauth_state: 'Sign-in session expired or cookies were blocked. Close other tabs for this site and try signing in again.',
  missing_code: 'GitHub did not return an authorization code. Try signing in again.',
  token_exchange_failed: 'Could not exchange the GitHub code for a token. Check GITHUB_CLIENT_SECRET and that the OAuth callback URL matches your GitHub app.',
  github_user_fetch_failed: 'Signed in with GitHub but could not load your profile. Try again.',
  oauth_callback_failed: 'Something went wrong finishing sign-in. Try again.',
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
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-sm">
              <Layers className="h-5 w-5 text-background" />
            </div>
            <span className="font-bold text-lg tracking-tight">RepoFuse</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Button size="sm" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-4 w-4 mr-2" />
                Sign in with GitHub
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden">
          {/* Background gradient effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-chart-1/5 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-72 h-72 bg-chart-5/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/80 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-1/20">
                  <Sparkles className="h-3 w-3 text-chart-1" />
                </span>
                <span className="font-medium text-foreground/90">New</span>
                <span className="text-border">·</span>
                <span>Cross-repo blueprint engine powered by Claude AI</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
                Ship what you&apos;ve
                <span className="block bg-gradient-to-r from-chart-1 via-chart-2 to-chart-4 bg-clip-text text-transparent">
                  already built
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                CodeVault scans your GitHub repositories and discovers products hiding across your codebase.
                Get AI-generated blueprints showing exactly what you can ship — and what&apos;s missing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button size="lg" className="min-w-[220px] h-12 text-base shadow-lg shadow-primary/20" asChild>
                  <Link href="/api/auth/github/login">
                    <Github className="h-5 w-5 mr-2" />
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[220px] h-12 text-base" asChild>
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Read-only access
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Results in seconds
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" />
                  Works with any stack
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics bar */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">12k+</p>
                <p className="text-sm text-muted-foreground mt-1">Repos analyzed</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">4.1k</p>
                <p className="text-sm text-muted-foreground mt-1">Blueprints generated</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">89%</p>
                <p className="text-sm text-muted-foreground mt-1">Avg code reuse</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">&lt;30s</p>
                <p className="text-sm text-muted-foreground mt-1">Analysis time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How CodeVault works</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              Three steps from scattered code to a launch-ready blueprint
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group relative p-8 rounded-2xl border border-border/60 bg-card/50 hover:bg-card/80 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
              <div className="absolute top-6 right-6 text-5xl font-bold text-muted/40 select-none">1</div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-chart-1/20 to-chart-1/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Github className="h-7 w-7 text-chart-1" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Connect repos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Link your GitHub repositories with read-only OAuth. We scan file structures — never store your source code.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-card/50 hover:bg-card/80 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
              <div className="absolute top-6 right-6 text-5xl font-bold text-muted/40 select-none">2</div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-chart-2/20 to-chart-2/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-7 w-7 text-chart-2" />
              </div>
              <h3 className="font-semibold text-xl mb-3">AI analyzes patterns</h3>
              <p className="text-muted-foreground leading-relaxed">
                Claude AI examines every file across all your repos — identifying components, APIs, utilities, and how they fit together.
              </p>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-card/50 hover:bg-card/80 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
              <div className="absolute top-6 right-6 text-5xl font-bold text-muted/40 select-none">3</div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-chart-4/20 to-chart-4/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Code2 className="h-7 w-7 text-chart-4" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Get blueprints</h3>
              <p className="text-muted-foreground leading-relaxed">
                See exactly what apps you can ship. Each blueprint shows files to reuse, what&apos;s missing, effort estimates, and a build plan.
              </p>
            </div>
          </div>
        </section>

        {/* Value proposition */}
        <section className="border-t border-border/50">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Stop rebuilding what you already have
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Most teams have 60-80% of their next product scattered across existing repos. CodeVault finds those hidden assets and shows you the shortest path to shipping.
                </p>
                <ul className="space-y-4">
                  {[
                    'Identifies reusable components across all your repos',
                    'Calculates exactly what percentage of code you can reuse',
                    'Shows the specific files missing to complete each app',
                    'Generates scaffold code and build plans for missing pieces',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-chart-1/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-chart-1" />
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-destructive/60" />
                    <div className="h-3 w-3 rounded-full bg-chart-4/60" />
                    <div className="h-3 w-3 rounded-full bg-chart-1/60" />
                    <span className="ml-2 text-xs text-muted-foreground font-mono">blueprint-result.json</span>
                  </div>
                  <pre className="text-xs text-muted-foreground font-mono leading-relaxed overflow-hidden">
{`{
  "name": "Customer Dashboard",
  "reuse_percentage": 78,
  "complexity": "moderate",
  "existing_files": [
    "components/Chart.tsx",
    "lib/api-client.ts",
    "hooks/useAuth.ts"
  ],
  "missing_files": [
    "app/dashboard/page.tsx",
    "api/metrics/route.ts"
  ],
  "estimated_effort": "1-2 days"
}`}
                  </pre>
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl bg-gradient-to-br from-chart-1/10 to-chart-4/10 blur-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <ImpactStats />

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Section */}
        <section className="border-t border-border/50">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to discover what you can ship?
              </h2>
              <p className="text-lg text-muted-foreground">
                Connect your GitHub and get your first blueprint in under a minute. Free to use, no credit card required.
              </p>
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" asChild>
                <Link href="/api/auth/github/login">
                  <Github className="h-5 w-5 mr-2" />
                  Start with GitHub
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-medium">CodeVault</span>
            </div>
            <p>Powered by Claude AI · Built with Next.js</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
