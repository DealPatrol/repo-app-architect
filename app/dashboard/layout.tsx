'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, GitBranch, Sparkles, Map, Settings, ChevronRight, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/repositories', label: 'Repositories', icon: GitBranch },
  { href: '/dashboard/analyses', label: 'Ideas', icon: Sparkles },
  { href: '/dashboard/results', label: 'Code Map', icon: Map },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.username) setUsername(d.username) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur h-12 flex items-center">
        <div className="flex items-center w-full px-4 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-6 bg-cv-indigo rounded flex items-center justify-center text-xs font-bold text-white leading-none">
              ⬡
            </div>
            <span className="font-semibold text-sm tracking-tight">CodeVault</span>
          </Link>

          <div className="text-border/60 text-lg font-light select-none hidden md:block">/</div>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              if (!isActive) return null
              return (
                <span key={item.href} className="flex items-center gap-1.5 text-foreground font-medium">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </span>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/analyses"
              className="hidden md:flex items-center gap-1.5 text-xs bg-accent/10 border border-cv-indigo-border text-accent px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              New Scan
            </Link>
            {username && (
              <span className="hidden md:block text-xs text-muted-foreground font-mono">
                @{username}
              </span>
            )}
            <div className="h-7 w-7 rounded-full bg-accent/20 border border-cv-indigo-border flex items-center justify-center text-xs font-bold text-accent uppercase">
              {username ? username[0] : 'U'}
            </div>
            <Link
              href="/api/auth/signout"
              className="hidden md:flex h-7 w-7 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-border bg-sidebar flex-shrink-0 pt-4">
          <nav className="px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto px-3 pb-4 border-t border-border pt-4 space-y-0.5">
            {username && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground font-mono truncate">
                <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold uppercase flex-shrink-0">
                  {username[0]}
                </div>
                @{username}
              </div>
            )}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <a
              href="/api/auth/signout"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </a>
            <Link
              href="/#pricing"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-accent hover:bg-accent/10 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Pro
            </Link>
          </div>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background flex items-center">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
