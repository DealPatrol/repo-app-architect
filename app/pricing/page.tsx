import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, ArrowRight, Sparkles, Github, Crown, Zap } from 'lucide-react'
import { RepoFuseLogo3D } from '@/components/repofuse-logo-3d'
import { NavDropdown } from '@/components/nav-dropdown'
import { PLANS } from '@/lib/stripe'
import { CREDITS } from '@/lib/credits'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring and learning',
    features: [
      `Up to ${PLANS.free.repos_limit} repositories`,
      `${PLANS.free.blueprints_viewable} blueprint views`,
      'AI-powered app blueprints',
      'Gap discovery & analysis',
      'Template browsing',
      'JSON export',
    ],
    icon: Zap,
    cta: 'Get Started Free',
    ctaHref: '/api/auth/github/login',
    ctaAlt: 'Or GitLab',
    ctaAltHref: '/api/auth/gitlab/login',
    highlighted: false,
    color: 'cyan',
  },
  {
    name: 'BYOK',
    price: `$${PLANS.byok.price_monthly}`,
    period: '/month',
    description: 'Bring your own API key',
    features: [
      'Unlimited repositories',
      'Unlimited analyses',
      'Use your own API keys',
      'Support for Anthropic, OpenAI, Grok, DeepInfra',
      'Up to 95% cheaper than Pro',
      'Full feature access',
      'Cancel anytime',
      'Perfect for cost-conscious builders',
    ],
    icon: Sparkles,
    cta: 'Start BYOK',
    ctaHref: '/dashboard/settings',
    highlighted: false,
    color: 'orange',
  },
  {
    name: 'Pro',
    price: `$${PLANS.pro.price_monthly}`,
    period: '/month',
    description: '7 days free, then $20/mo',
    features: [
      '7-day free trial',
      'Unlimited repositories',
      'Unlimited analyses',
      'AI-powered app blueprints',
      'Scaffold code generation',
      'Template assembly hub',
      'Priority AI processing',
      'Complete gap roadmaps',
      `${CREDITS.INITIAL_GRANT.toLocaleString()} monthly credits`,
      'Cancel anytime',
    ],
    icon: Crown,
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/dashboard/billing',
    highlighted: true,
    color: 'yellow',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Grid background */}
      <div className="fixed inset-0 -z-10 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} 
        />
      </div>
      {/* Glowing orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
      <div className="fixed top-40 right-1/4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <RepoFuseLogo3D className="h-10 w-10" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Link href="/" className="text-xs font-mono tracking-widest text-cyan-400/60 hover:text-cyan-300 transition-colors hidden md:block uppercase">
              Home
            </Link>
            <Link href="/dashboard" className="text-xs font-mono tracking-widest text-cyan-400/60 hover:text-cyan-300 transition-colors hidden md:block uppercase">
              Dashboard
            </Link>
            <NavDropdown />
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-[#24292e] hover:bg-[#2f363d] text-white border border-gray-700 hover:border-gray-600 gap-1.5" asChild>
                <Link href="/api/auth/github/login">
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </Link>
              </Button>
              <Button size="sm" className="bg-[#fc6d26] hover:bg-[#e24329] text-white gap-1.5" asChild>
                <Link href="/api/auth/gitlab/login">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.6 6.15 12 0 .4 6.15a.88.88 0 0 0-.3 1.1l1.88 5.77H0v4.27h2.58l2.4 7.38a.88.88 0 0 0 .83.56h12.38a.88.88 0 0 0 .83-.56l2.4-7.38H24v-4.27h-2.08l1.88-5.77a.88.88 0 0 0-.28-1.1z"/>
                  </svg>
                  <span className="hidden sm:inline">GitLab</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-sm text-cyan-300 mb-6">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="font-mono tracking-widest uppercase text-xs">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
            Choose your <span className="text-cyan-300">plan</span>
          </h1>
          <p className="text-lg text-cyan-200/60 max-w-2xl mx-auto">
            Start free and upgrade when you're ready for unlimited analyses, scaffold generation, and more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-6 flex flex-col bg-black/60 backdrop-blur-sm ${
                plan.highlighted
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-500/20'
                  : plan.color === 'cyan' 
                    ? 'border-cyan-500/30' 
                    : 'border-orange-500/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={`h-5 w-5 ${
                    plan.color === 'cyan' ? 'text-cyan-400' : 
                    plan.color === 'orange' ? 'text-orange-400' : 'text-yellow-400'
                  }`} />
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <p className="text-sm text-cyan-200/50">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-black ${
                  plan.color === 'cyan' ? 'text-cyan-300' : 
                  plan.color === 'orange' ? 'text-orange-300' : 'text-yellow-300'
                }`}>{plan.price}</span>
                <span className="text-cyan-400/60 ml-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.color === 'cyan' ? 'bg-cyan-500/20' : 
                      plan.color === 'orange' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <Check className={`h-3 w-3 ${
                        plan.color === 'cyan' ? 'text-cyan-400' : 
                        plan.color === 'orange' ? 'text-orange-400' : 'text-yellow-400'
                      }`} />
                    </span>
                    <span className="text-sm text-cyan-200/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full font-bold ${
                  plan.highlighted 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black shadow-lg shadow-yellow-500/30' 
                    : plan.color === 'cyan'
                      ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/70 hover:border-cyan-400'
                      : 'bg-orange-950/50 border border-orange-500/40 text-orange-300 hover:bg-orange-950/70 hover:border-orange-400'
                }`}
                asChild
              >
                <Link href={plan.ctaHref}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-cyan-400/40 mt-12 max-w-lg mx-auto font-mono">
          All plans include read-only GitHub access. Cancel anytime. Your code is never stored.
        </p>
      </main>
    </div>
  )
}
