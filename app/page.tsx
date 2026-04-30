import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Sparkles, Layers, ArrowRight, AlertCircle, Rocket, ChevronRight, Eye, Puzzle, Zap } from 'lucide-react'

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

      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Layers className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CodeVault</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button size="sm" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-4 w-4 mr-2" />
                Sign in
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_60%)]" />
          <div className="container mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-32 md:pb-36 relative">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-medium">AI-powered code intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.08]">
                Your next product is
                <br />
                <span className="text-primary">already built.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                CodeVault scans your GitHub repositories and finds complete applications hiding in your existing code.
                Stop rebuilding what you already have.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button size="lg" className="min-w-[220px] h-12 text-base" asChild>
                  <Link href="/api/auth/github/login">
                    <Github className="h-5 w-5 mr-2" />
                    Connect GitHub
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[220px] h-12 text-base" asChild>
                  <Link href="/dashboard">
                    Explore Dashboard
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
                Read-only access. We analyze structure and patterns — your source code is never stored.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics strip */}
        <section className="border-y border-border/50 bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 py-10 md:py-14">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">12k+</p>
                <p className="text-sm text-muted-foreground mt-1.5">Repos scanned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">4.1k</p>
                <p className="text-sm text-muted-foreground mt-1.5">Apps discovered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums">73%</p>
                <p className="text-sm text-muted-foreground mt-1.5">Avg. code reuse</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">38</p>
                <p className="text-sm text-muted-foreground mt-1.5">Stacks supported</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value proposition */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                From scattered files to shipping products
              </h2>
              <p className="text-lg text-muted-foreground">
                Most teams have already built 60-80% of their next product — it&apos;s just spread across different repositories. We find it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">See what you own</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Connect your repositories and our AI maps every component, utility, hook, and API across your entire codebase.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Puzzle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Discover hidden apps</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AI cross-references your files and surfaces complete product blueprints — showing exactly what you can ship today.
                </p>
              </div>

              <div className="group p-8 rounded-2xl border border-border/60 bg-card/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Ship in hours, not months</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get a build plan with reusable files, missing pieces to generate, and estimated effort. Go from blueprint to product fast.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 md:py-32 bg-card/30 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Three steps to your next launch
              </h2>
              <p className="text-lg text-muted-foreground">
                Connect, scan, ship. CodeVault handles the heavy lifting.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div className="hidden md:block h-px flex-1 bg-border" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Connect repos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sign in with GitHub and import your repositories. We scan with read-only access — nothing is modified.
                  </p>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div className="hidden md:block h-px flex-1 bg-border" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">AI analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our AI examines every file — components, utilities, APIs — and identifies reusable building blocks across all your repos.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Get blueprints</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Receive detailed app blueprints showing what to reuse, what&apos;s missing, and a build plan ranked by ship-readiness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary">
                <Rocket className="h-3.5 w-3.5" />
                <span className="font-medium">Free to start</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Stop building from scratch
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Connect your GitHub and discover the products you&apos;ve already (mostly) built. Your first analysis is on us.
              </p>
              <Button size="lg" className="h-12 text-base px-8" asChild>
                <Link href="/api/auth/github/login">
                  <Github className="h-5 w-5 mr-2" />
                  Get started free
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Layers className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium text-foreground/80">CodeVault</span>
            </div>
            <p className="text-muted-foreground/60">AI-powered code intelligence for shipping faster.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
