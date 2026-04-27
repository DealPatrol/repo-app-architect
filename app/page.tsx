import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, Sparkles, Code2, ArrowRight, AlertCircle, ShieldCheck, Workflow, FileJson2, CheckCircle2 } from 'lucide-react'
import { AppLogo } from '@/components/app-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { CheckoutButton } from '@/components/checkout-button'
import { CODEVAULT_PRO_PLAN } from '@/lib/billing'

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
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <AppLogo />
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign in with GitHub</span>
                <span className="sm:hidden">Sign in</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-double border-border/80 bg-card/60 text-sm text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground/90">New</span>
            <span className="text-border">·</span>
            <span>Maps what you already shipped to what you can ship next</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Discover Apps Hidden in Your Code
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Teams use CodeVault to surface products they have already mostly built — scattered across repos —
            then ship them as one coherent app. Connect GitHub and turn existing files into concrete blueprints.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" className="min-w-[200px]" asChild>
              <Link href="/api/auth/github/login">
                Sign in with GitHub
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px] border-double" asChild>
              <Link href="/dashboard/repositories">
                Open Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Read-only GitHub access. Your code stays yours — we analyze structure and patterns to suggest combinations, not to store your source.
          </p>
        </div>

        <div className="mt-16 max-w-5xl mx-auto rounded-xl border border-border bg-card/40 px-6 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Built for teams that need confidence before generation
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">Read-only by design</p>
              <p className="text-sm text-muted-foreground mt-1">Connect repositories without granting write access to source code.</p>
            </div>
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Workflow className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">Cross-repo intelligence</p>
              <p className="text-sm text-muted-foreground mt-1">Map reusable components, APIs, hooks, and utilities across your stack.</p>
            </div>
            <div>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileJson2 className="h-5 w-5" />
              </div>
              <p className="font-semibold text-foreground">Portable outputs</p>
              <p className="text-sm text-muted-foreground mt-1">Export structured blueprints that explain what exists and what to build next.</p>
            </div>
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

        <section id="pricing" className="mt-32 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Stripe-powered billing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Upgrade when your code map becomes a product roadmap
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Start with the core analysis workflow, then move teams onto a paid workspace when you need deeper exports and repeatable planning.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-stretch">
            <div className="rounded-xl border border-border bg-card/60 p-6">
              <p className="text-sm font-medium text-muted-foreground">Starter</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground mb-1">/ month</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Explore the product and connect repositories while you validate the workflow.
              </p>
              <Button variant="outline" className="mt-6 w-full" asChild>
                <Link href="/dashboard/repositories">Open dashboard</Link>
              </Button>
            </div>

            <div className="rounded-2xl border border-foreground/20 bg-card p-6 shadow-xl shadow-foreground/5 relative overflow-hidden">
              <div className="absolute right-6 top-6 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                Recommended
              </div>
              <p className="text-sm font-medium text-muted-foreground">{CODEVAULT_PRO_PLAN.name}</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold">{CODEVAULT_PRO_PLAN.priceLabel}</span>
                <span className="text-muted-foreground mb-1">/ {CODEVAULT_PRO_PLAN.interval}</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{CODEVAULT_PRO_PLAN.description}</p>
              <ul className="mt-6 grid gap-3 text-sm">
                {CODEVAULT_PRO_PLAN.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <CheckoutButton planId={CODEVAULT_PRO_PLAN.id} className="mt-8 w-full" />
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Secure checkout is hosted by Stripe. No card data touches CodeVault servers.
              </p>
            </div>
          </div>
        </section>

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
            <AppLogo markClassName="h-6 w-6 rounded-md" textClassName="text-sm text-muted-foreground" />
            <p>Built with Next.js and Vercel AI SDK</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
