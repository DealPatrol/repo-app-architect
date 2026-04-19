import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Github, ArrowRight, Check, X } from 'lucide-react'

function getGitHubAuthUrl() {
  // Read all possible env var names — works for both NEXT_PUBLIC_ and server-only variants
  const clientId =
    process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ||
    process.env.GITHUB_CLIENT_ID
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL
  if (!clientId || !appUrl) return '/dashboard'
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,read:user&redirect_uri=${appUrl}/api/auth/github/callback`
}

const stats = [
  { value: '2,400+', label: 'Developers' },
  { value: '18,000+', label: 'Ideas Generated' },
  { value: '340+', label: 'Apps Shipped' },
  { value: '4.9', label: 'Avg Rating' },
]

const features = [
  {
    title: 'Cross-Platform Scanning',
    description:
      'One-click OAuth connection to GitHub, Vercel, Replit, GitLab, Netlify, and Claude. We scan every file, function, and component across your entire portfolio.',
  },
  {
    title: 'AI Pattern Detection',
    description:
      'Claude AI cross-references auth, payment, UI, and data patterns across all your repos to identify what complete apps you can assemble — right now.',
  },
  {
    title: 'Ready-to-Build Ideas',
    description:
      'Each idea shows the exact files you already have, files you\'re missing, an AI-written project brief, and a scaffold builder that assembles the project for you.',
  },
  {
    title: 'Gap Analysis',
    description:
      'For ideas that are "almost ready," CodeVault tells you exactly which 1–3 files you\'re missing and generates them with Claude AI in one click.',
  },
  {
    title: 'Code Intelligence',
    description:
      'Deep insights into your tech stack distribution, component reusability scores, build velocity, and which platforms your best ideas come from.',
  },
  {
    title: 'Private & Secure',
    description:
      'Read-only OAuth scopes. We never write to your repos. Your code is scanned in memory and never stored. Your ideas are yours forever.',
  },
]

const steps = [
  {
    num: '1',
    title: 'Connect',
    description: 'One-click OAuth to GitHub, Vercel, Replit & more. Read-only. Takes 30 seconds.',
  },
  {
    num: '2',
    title: 'Analyze',
    description: 'AI scans every file across all platforms and finds cross-repo patterns.',
  },
  {
    num: '3',
    title: 'Discover',
    description: 'See every app you can build, sorted by build time and match score.',
  },
  {
    num: '4',
    title: 'Ship',
    description: 'Click "Build" — we scaffold the project, generate missing files, and pre-load Claude with your full code context.',
  },
]

const testimonials = [
  {
    quote:
      'I had an e-commerce app sitting in 3 different repos for 2 years. CodeVault found it in 8 seconds and told me exactly how to wire them together. I shipped in 4 days.',
    name: 'Marcus K.',
    role: 'Full-stack developer, 12 GitHub repos',
    initials: 'MK',
  },
  {
    quote:
      'The gap analysis is insane. It told me I was missing exactly 2 files for a full SaaS app. Generated both with Claude AI in one click. Mind blown.',
    name: 'Sarah L.',
    role: 'Solo founder, previously wasted 3 restarts',
    initials: 'SL',
  },
  {
    quote:
      'I had 47 Replit repls and zero shipped products. After CodeVault, I had 6 real project ideas and shipped the first one in a week. This is the tool I always needed.',
    name: 'Jordan R.',
    role: 'Indie hacker, 3 products now live',
    initials: 'JR',
  },
]

const plans = [
  {
    name: 'STARTER',
    price: '$0',
    sub: 'Free forever',
    description: 'Try CodeVault with your first few platforms. Perfect for exploring what you already have.',
    cta: 'Get started free',
    ctaHref: '#',
    popular: false,
    features: [
      { text: '3 platform connections', included: true },
      { text: 'Up to 10 ideas per scan', included: true },
      { text: 'Ready-to-build detection', included: true },
      { text: 'Basic gap analysis', included: true },
      { text: 'AI file generation', included: false },
      { text: 'Project scaffolding', included: false },
      { text: 'Code Map & Insights', included: false },
    ],
  },
  {
    name: 'PRO',
    price: '$19',
    sub: '/mo or $15/mo billed annually',
    description: 'For developers serious about shipping. Everything you need to turn your codebase into products.',
    cta: 'Start Pro free for 7 days',
    ctaHref: '#',
    popular: true,
    features: [
      { text: 'Unlimited platform connections', included: true },
      { text: 'Unlimited ideas per scan', included: true },
      { text: 'AI file generation (Claude)', included: true },
      { text: 'Project scaffold builder', included: true },
      { text: 'Code Map & Insights', included: true },
      { text: 'README & brief generator', included: true },
      { text: 'Auto re-scan & weekly digest', included: true },
    ],
  },
  {
    name: 'TEAM',
    price: '$49',
    sub: '/mo up to 5 seats',
    description: 'For dev teams wanting to discover shared opportunities across everyone\'s code.',
    cta: 'Start Team trial',
    ctaHref: '#',
    popular: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 team seats', included: true },
      { text: 'Shared vault & ideas', included: true },
      { text: 'Team code map view', included: true },
      { text: 'Admin controls', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
    ],
  },
]

const platforms = ['GitHub', '▲ Vercel', 'Replit', '◆ Claude', 'GitLab', 'Netlify']

export default function HomePage() {
  const authUrl = getGitHubAuthUrl()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 bg-cv-indigo rounded flex items-center justify-center text-xs font-bold text-white">⬡</div>
              <span className="font-semibold text-base tracking-tight">CodeVault</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
              <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block">
              Sign in
            </Link>
            <Button size="sm" asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4">
              <a href={authUrl}>
                Get started free
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(var(--cv-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--cv-grid-line) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <p className="text-sm text-muted-foreground mb-6 font-mono tracking-wide uppercase">AI-powered code intelligence</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6 text-balance">
            Turn your existing<br />code into products.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            Connect GitHub, Vercel, Replit, and more. Our AI scans everything you&apos;ve built, finds reusable patterns across every repo, and tells you exactly which apps you can ship — using code you already own.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button size="lg" asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-7 h-12 text-base font-medium">
              <a href={authUrl}>
                <Github className="h-4 w-4 mr-2" />
                Start for free — no credit card
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-7 h-12 text-base border-border/60">
              <Link href="#how-it-works">Watch a demo</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Free plan includes 3 platforms + 10 ideas. Upgrade anytime for unlimited access.</p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {stats.map((s) => (
              <div key={s.label} className="bg-card px-8 py-6">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-cv-indigo mb-3">WHAT CODEVAULT DOES</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Everything to turn code<br />into revenue</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-balance">
            Most developers have the code to build 5+ products sitting in their repos right now. CodeVault finds them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-border bg-card hover:border-cv-indigo-border transition-colors">
              <div className="h-8 w-8 rounded-lg bg-cv-indigo-dim border border-cv-indigo-border flex items-center justify-center mb-4">
                <div className="h-2 w-2 rounded-full bg-cv-indigo" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Platform logos */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {platforms.map((p) => (
            <div key={p} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground font-mono">
              {p}
            </div>
          ))}
          <div className="px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground">+ more coming</div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-widest text-cv-indigo mb-3">SIMPLE AS 1-2-3-4</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">From code to shipped product<br />in under a week</h2>
            <p className="text-muted-foreground">The average developer finds 7 ready-to-build ideas in their first scan.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="h-10 w-10 rounded-full border border-cv-indigo-border bg-cv-indigo-dim flex items-center justify-center text-cv-indigo font-bold font-mono mb-4">
                  {s.num}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-widest text-cv-indigo mb-3">EARLY ACCESS FEEDBACK</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Developers are already<br />finding hidden products</h2>
            <p className="text-muted-foreground">From the first cohort of CodeVault users.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl border border-border bg-card flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-cv-indigo-dim border border-cv-indigo-border flex items-center justify-center text-xs font-bold text-cv-indigo font-mono">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-widest text-cv-indigo mb-3">SIMPLE PRICING</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start free, upgrade when<br />you&apos;re ready to ship</h2>
            <p className="text-muted-foreground">No hidden fees. Cancel anytime. Your ideas stay yours forever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-xl border flex flex-col gap-6 ${
                  plan.popular
                    ? 'border-cv-indigo bg-cv-indigo-dim ring-1 ring-cv-indigo-border'
                    : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-cv-indigo text-white text-xs font-bold px-3 py-1 rounded-full font-mono tracking-wide">MOST POPULAR</span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.sub}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5 text-sm">
                      {f.included
                        ? <Check className="h-4 w-4 text-cv-indigo flex-shrink-0" />
                        : <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />}
                      <span className={f.included ? 'text-foreground' : 'text-muted-foreground/50'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={plan.popular
                    ? 'bg-cv-indigo hover:bg-cv-indigo/90 text-white w-full rounded-lg'
                    : 'w-full rounded-lg'}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <a href={plan.ctaHref}>{plan.cta}</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-cv-indigo rounded flex items-center justify-center text-xs text-white">⬡</div>
            <span className="font-semibold text-foreground">CodeVault</span>
            <span>— Turn your existing code into products.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={authUrl} className="hover:text-foreground transition-colors">Get started free</a>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <span>Built with ◆ Claude AI</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-6 text-xs text-muted-foreground/50">
          &copy; 2025 CodeVault. Your code, reimagined.
        </div>
      </footer>
    </div>
  )
}
