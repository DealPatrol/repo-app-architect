import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RepoFuseLogo } from '@/components/repofuse-logo'
import { Github, ArrowRight, AlertCircle, Shield, Zap, GitBranch, Rocket, Code2, Sparkles } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  auth_required: 'You must sign in to access the dashboard.',
  github_oauth_not_configured: 'GitHub OAuth is not configured.',
  gitlab_oauth_not_configured: 'GitLab OAuth is not configured.',
  invalid_oauth_state: 'Sign-in session expired or cookies were blocked.',
  missing_code: 'Your OAuth provider did not return an authorization code.',
  token_exchange_failed: 'Could not exchange the authorization code for a token.',
  github_user_fetch_failed: 'Signed in but could not load your profile.',
  gitlab_user_fetch_failed: 'Signed in but could not load your profile.',
  oauth_callback_failed: 'Something went wrong finishing sign-in.',
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'An unexpected error occurred.' : null

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {errorMessage && (
        <div className="bg-red-950/50 border-b border-red-500/30 px-4 py-3 flex items-center gap-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Animated scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
      }} />

      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px'
      }} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <RepoFuseLogo className="h-40 w-full max-w-xs" />
          </Link>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-xs font-mono letter-spacing tracking-widest text-cyan-400/60 hover:text-cyan-300 transition-colors hidden sm:block uppercase">
              Features
            </a>
            <a href="#how" className="text-xs font-mono letter-spacing tracking-widest text-cyan-400/60 hover:text-cyan-300 transition-colors hidden sm:block uppercase">
              How It Works
            </a>
            <Button size="sm" variant="outline" className="border-cyan-500/30 bg-black hover:bg-cyan-950/30 hover:border-cyan-400/60 text-cyan-300" asChild>
              <Link href="/api/auth/github/login">
                Sign In
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden pt-16 pb-20">
          {/* Animated grid background */}
          <div className="absolute inset-0 -z-10" style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridDrift 20s linear infinite'
          }} />

          {/* Glowing orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -z-10 opacity-50" style={{ animation: 'pulse 4s ease-in-out infinite 1s' }} />
          <div className="absolute top-1/2 -right-32 w-72 h-72 bg-magenta-500/5 rounded-full blur-3xl -z-10 opacity-40" style={{ animation: 'pulse 5s ease-in-out infinite 2s' }} />

          <div className="container mx-auto px-4 pt-8 pb-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Left content */}
              <div className="space-y-8 z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-xs font-mono text-cyan-300 w-fit">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Now in Public Beta
                </div>
                
                {/* Heading */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight">
                    <span className="block text-white">Your repos.</span>
                    <span className="block bg-gradient-to-r from-cyan-400 via-orange-400 to-magenta-400 bg-clip-text text-transparent animate-pulse">
                      Fused with AI.
                    </span>
                  </h1>
                </div>
                
                {/* Subheading */}
                <p className="text-lg text-cyan-200/70 max-w-lg leading-relaxed">
                  RepoFuse scans your connected GitHub or GitLab repos and surfaces buildable project ideas, detects hidden potential, and turns scattered code into your next big launch — automatically.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-base h-12 shadow-lg shadow-cyan-500/40" asChild>
                    <Link href="/api/auth/github/login">
                      <Github className="h-5 w-5 mr-2" />
                      Get Started Free
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" className="bg-orange-950/40 border border-orange-500/40 hover:bg-orange-950/60 hover:border-orange-400/60 text-orange-300 font-bold text-base h-12" asChild>
                    <Link href="/api/auth/gitlab/login">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.6 6.15 12 0 .4 6.15a.88.88 0 0 0-.3 1.1l1.88 5.77H0v4.27h2.58l2.4 7.38a.88.88 0 0 0 .83.56h12.38a.88.88 0 0 0 .83-.56l2.4-7.38H24v-4.27h-2.08l1.88-5.77a.88.88 0 0 0-.28-1.1z"/>
                      </svg>
                      Or GitLab
                    </Link>
                  </Button>
                </div>

                {/* Social proof */}
                <div className="pt-4 text-xs text-cyan-400/50 font-mono">
                  <span className="text-cyan-300">2,400+</span> developers already on the waitlist
                </div>
              </div>

              {/* Right: Terminal window */}
              <div className="relative z-10">
                <div className="bg-black/80 border border-cyan-500/30 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/20 backdrop-blur-sm">
                  {/* Terminal header */}
                  <div className="bg-cyan-950/40 border-b border-cyan-500/20 px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-xs font-mono text-cyan-400">repofuse — repo-scanner</span>
                  </div>

                  {/* Terminal body */}
                  <div className="p-6 font-mono text-sm space-y-2 h-72 overflow-hidden">
                    <div className="flex gap-3">
                      <span className="text-cyan-400">$</span>
                      <span className="text-white">repofuse scan --org DealPatrol</span>
                    </div>
                    <div className="pt-2 space-y-1 text-cyan-300/70">
                      <div>▸ Connecting to GitHub API...</div>
                      <div className="text-cyan-300">✓ Found 14 repositories</div>
                      <div>▸ Analyzing code patterns...</div>
                    </div>
                    <div className="pt-3 text-cyan-200/80 space-y-1">
                      <div>📦 repo-app-architect</div>
                      <div className="text-orange-400 ml-2">⚡ 3 buildable ideas detected</div>
                      <div className="text-cyan-300 ml-3">→ SaaS: AI Code Review Tool</div>
                      <div className="text-cyan-300 ml-3">→ Tool: Repo Health Dashboard</div>
                      <div className="text-cyan-300 ml-3">→ API: Webhook Automation Kit</div>
                    </div>
                    <div className="pt-3 text-cyan-300/70">
                      <div>▸ Generating project briefs...</div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <span className="text-cyan-400">$</span>
                      <span className="w-2 h-5 bg-cyan-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="border-y border-cyan-500/20 bg-gradient-to-b from-cyan-950/10 to-transparent py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-black text-cyan-300 tabular-nums">12k+</p>
                <p className="text-xs text-cyan-400/60 font-mono uppercase tracking-widest">Repos Scanned</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-black text-orange-300 tabular-nums">4.1k</p>
                <p className="text-xs text-orange-400/60 font-mono uppercase tracking-widest">Ideas Found</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-black text-magenta-300 tabular-nums">89%</p>
                <p className="text-xs text-magenta-400/60 font-mono uppercase tracking-widest">Code Reuse</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-black text-cyan-300 tabular-nums">&lt;30s</p>
                <p className="text-xs text-cyan-400/60 font-mono uppercase tracking-widest">Analysis Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="py-20 border-b border-cyan-500/20 bg-gradient-to-b from-black via-cyan-950/5 to-black">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 mb-6 text-xs font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                HOW IT WORKS
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Four steps to<br />
                <span className="bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
                  buildable blueprints
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-0 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-24 left-12.5% right-12.5% h-1 bg-gradient-to-r from-cyan-500 via-orange-500 to-magenta-500 opacity-20" />

              {[
                { num: '01', title: 'Connect', icon: '🔗', desc: 'OAuth in one click. Read-only access to your repos.' },
                { num: '02', title: 'Scan', icon: '⚡', desc: 'AI analyzes structure, patterns, and dependencies.' },
                { num: '03', title: 'Discover', icon: '💡', desc: 'Ideas surface instantly, ranked by viability.' },
                { num: '04', title: 'Build', icon: '🚀', desc: 'Get full briefs, stack recs, and MVP roadmaps.' }
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className="p-6 text-center">
                    {/* Step number background */}
                    <div className="relative z-10 mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                        i === 0 ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/30' :
                        i === 3 ? 'border-orange-500 bg-orange-950/40 shadow-lg shadow-orange-500/30' :
                        'border-cyan-500/40 bg-cyan-950/20'
                      } group-hover:border-opacity-100 group-hover:shadow-lg group-hover:scale-110`}>
                        <span className="text-2xl font-black bg-gradient-to-br from-cyan-300 to-orange-300 bg-clip-text text-transparent">{step.num}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-cyan-200/60">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 mb-6 text-xs font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                FEATURES
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything your repos<br />
                <span className="bg-gradient-to-r from-cyan-400 via-orange-400 to-magenta-400 bg-clip-text text-transparent">
                  have been waiting for
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '⚡', title: 'AI Repo Scanner', desc: 'Deep analysis of your codebase structure and patterns in seconds.' },
                { icon: '💡', title: 'Idea Surfacer', desc: 'Turns existing code into ranked, buildable project ideas.' },
                { icon: '🔗', title: 'Multi-Repo Fusion', desc: 'Cross-reference patterns across all your repos simultaneously.' },
                { icon: '📊', title: 'Health Dashboard', desc: 'Live metrics on code quality and technical debt.' },
                { icon: '📋', title: 'Launch Briefs', desc: 'AI-generated product briefs for every detected idea.' },
                { icon: '🔒', title: 'Private by Default', desc: 'Your code never leaves your control.' }
              ].map((feature, i) => (
                <div key={i} className="group relative p-6 border border-cyan-500/20 bg-cyan-950/10 hover:bg-cyan-950/20 hover:border-cyan-400/40 rounded-lg transition-all duration-300 cursor-pointer">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-cyan-200/60">{feature.desc}</p>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-cyan-500/20">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Your next product is<br />
              <span className="bg-gradient-to-r from-cyan-400 via-orange-400 to-magenta-400 bg-clip-text text-transparent">
                already in your repos
              </span>
            </h2>
            <p className="text-lg text-cyan-200/70 mb-8">
              Join 2,400+ developers who've stopped guessing and started shipping.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-base h-12 shadow-lg shadow-cyan-500/40" asChild>
              <Link href="/api/auth/github/login">
                <Github className="h-5 w-5 mr-2" />
                Start Scanning Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-cyan-400/50 font-mono mt-6">
              free forever plan · no credit card required · read-only access
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-black/50 py-8">
        <div className="container mx-auto px-4 text-center text-xs text-cyan-400/40 font-mono">
          © 2025 RepoFuse. Built by developers, for developers.
        </div>
      </footer>

      <style>{`
        @keyframes gridDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
      `}</style>
    </div>
  )
}
