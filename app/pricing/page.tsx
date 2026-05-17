import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, ArrowRight, Sparkles, Github, Crown, Zap, Rocket, Key } from 'lucide-react'
import { RepoFuseLogo } from '@/components/repofuse-logo'
import { PLANS } from '@/lib/stripe'
import { CREDITS } from '@/lib/credits'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Explore your codebase, no card needed',
    credits: PLANS.free.credits_per_month,
    features: [
      `${PLANS.free.repos_limit} repository`,
      `${PLANS.free.analyses_per_month} analysis per month`,
      `${PLANS.free.blueprints_viewable} blueprint view`,
      `${PLANS.free.credits_per_month} credits to start`,
      'AI-powered app blueprints',
      'Gap discovery & analysis',
      'JSON export',
    ],
    icon: Zap,
    cta: 'Get Started Free',
    ctaHref: '/api/auth/github/login',
    highlighted: false,
    checkoutPlan: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: `$${PLANS.pro.price_monthly}`,
    period: '/month',
    description: '7-day free trial, cancel anytime',
    credits: PLANS.pro.credits_per_month,
    features: [
      '7-day free trial',
      'Unlimited repositories',
      'Unlimited analyses',
      `${PLANS.pro.credits_per_month.toLocaleString()} credits/month`,
      'AI app blueprints + scaffold generation',
      'Build This App — push to GitHub/GitLab',
      'Pattern Analyzer — new project ideas',
      'Complete gap roadmaps',
      'Priority AI processing',
      'Cancel anytime',
    ],
    icon: Crown,
    cta: 'Start Free Trial',
    ctaHref: '/dashboard/billing',
    highlighted: true,
    checkoutPlan: 'pro',
  },
  {
    id: 'scale',
    name: 'Scale',
    price: `$${PLANS.scale.price_monthly}`,
    period: '/month',
    description: 'For power users and teams',
    credits: PLANS.scale.credits_per_month,
    features: [
      'Everything in Pro',
      `${PLANS.scale.credits_per_month.toLocaleString()} credits/month`,
      'Highest priority AI processing',
      'Early access to new features',
      'Dedicated support',
      'Cancel anytime',
    ],
    icon: Rocket,
    cta: 'Get Scale',
    ctaHref: 'https://buy.stripe.com/3cIcN65VJ55g6nC9gkbjW00',
    highlighted: false,
    checkoutPlan: 'scale',
  },
  {
    id: 'byok',
    name: 'BYOK',
    price: `$${PLANS.byok.price_monthly}`,
    period: '/month',
    description: 'Unlimited with your own API key',
    credits: null,
    features: [
      'Unlimited repositories',
      'Unlimited analyses',
      'Use your own Anthropic / OpenAI key',
      'No per-credit billing',
      'Up to 90% cheaper than Pro',
      'Full feature access',
      'Cancel anytime',
    ],
    icon: Key,
    cta: 'Start BYOK',
    ctaHref: '/dashboard/settings',
    highlighted: false,
    checkoutPlan: null,
  },
]

const creditCosts = [
  { action: 'Run an Analysis', cost: CREDITS.ANALYSIS_COST, icon: '🔍' },
  { action: 'Generate Scaffold', cost: CREDITS.SCAFFOLD_COST, icon: '🏗️' },
  { action: 'Pattern Analyzer', cost: CREDITS.PATTERN_ANALYZER_COST, icon: '✨' },
  { action: 'Build This App', cost: CREDITS.BUILD_APP_COST, icon: '🚀' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <RepoFuseLogo className="h-40 w-full max-w-xl" />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Button size="sm" variant="outline" className="border-border/60 hover:bg-accent" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-4 w-4 mr-2" />
                Sign in
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/80 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4 text-chart-1" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Pick your plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more power — unlimited repos, more credits, and the ability to build and push real apps.
          </p>
        </div>

        {/* Plan grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const PlanIcon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-chart-1/40 shadow-lg shadow-chart-1/10 ring-1 ring-chart-1/20'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-chart-1 text-background text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center mb-3">
                    <PlanIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  {plan.credits != null && (
                    <p className="text-xs text-chart-1 font-medium mt-1">
                      {plan.credits.toLocaleString()} credits/mo
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-chart-1/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-chart-1" />
                      </span>
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="sm"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className={`w-full ${plan.highlighted ? 'shadow-lg shadow-primary/20' : ''}`}
                  asChild
                >
                  <Link href={plan.ctaHref}>
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </Card>
            )
          })}
        </div>

        {/* Credit costs table */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">How credits work</h2>
            <p className="text-muted-foreground text-sm">
              Each action costs credits. Pro gets 3,000/mo, Scale gets 12,000/mo — unused credits don't roll over.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {creditCosts.map((item) => (
              <Card key={item.action} className="p-4 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-xs text-muted-foreground mb-1">{item.action}</p>
                <p className="text-lg font-bold text-foreground">{item.cost}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </Card>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-lg mx-auto">
          All plans include read-only repository access. Your code is never stored — we only analyze file structures and patterns.
        </p>
      </main>
    </div>
  )
}
