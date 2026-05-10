import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Layers, ArrowRight, Sparkles, Github } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { PricingUpgradeButton } from '@/components/pricing-upgrade-button'

export const dynamic = 'force-dynamic'

const FREE_FEATURES = [
  'Up to 5 repositories',
  '3 analyses per month',
  'AI-powered blueprints',
  'Export as JSON',
  'Build plan downloads',
]

const PRO_FEATURES = [
  'Unlimited repositories',
  'Unlimited analyses',
  'AI-powered blueprints',
  'Export as JSON & PDF',
  'Build plan downloads',
  'Scaffold generation',
  'Priority AI processing',
  'GitHub repo creation from blueprints',
]

export default async function PricingPage() {
  let isLoggedIn = false
  try {
    const user = await getCurrentUser()
    isLoggedIn = !!user
  } catch {
    // DB unavailable
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-sm">
              <Layers className="h-5 w-5 text-background" />
            </div>
            <span className="font-bold text-lg tracking-tight">RepoFuse</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/80 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4 text-chart-1" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need unlimited analyses and premium features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <Card className="relative p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">Free</h3>
              <p className="text-sm text-muted-foreground mt-1">For individuals exploring their codebase</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground ml-1">forever</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded-full bg-chart-1/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-chart-1" />
                  </span>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href={isLoggedIn ? '/dashboard' : '/api/auth/github/login'}>
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </Card>

          {/* Pro plan */}
          <Card className="relative p-8 flex flex-col border-chart-1/40 shadow-lg shadow-chart-1/10 ring-1 ring-chart-1/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-chart-1 text-background text-xs font-bold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">Pro</h3>
              <p className="text-sm text-muted-foreground mt-1">For teams shipping faster with code reuse</p>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-foreground">$19</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded-full bg-chart-1/15 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-chart-1" />
                  </span>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            {isLoggedIn ? (
              <PricingUpgradeButton />
            ) : (
              <Button size="lg" className="w-full shadow-lg shadow-primary/20" asChild>
                <Link href="/api/auth/github/login">
                  <Github className="h-4 w-4 mr-2" />
                  Sign in to Upgrade
                </Link>
              </Button>
            )}
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-lg mx-auto">
          All plans include read-only GitHub access. Cancel anytime. Your code is never stored — we only analyze file structures and patterns.
        </p>
      </main>
    </div>
  )
}
