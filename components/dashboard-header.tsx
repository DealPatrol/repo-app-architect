'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, BarChart3, FolderGit2, Sparkles, CreditCard, LayoutGrid, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RepoFuseLogo } from '@/components/repofuse-logo'
import type { AuthUser } from '@/lib/auth'

interface DashboardHeaderProps {
  user: AuthUser | null
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/repositories', label: 'Repositories', icon: FolderGit2 },
  { href: '/dashboard/analyses', label: 'Analyses', icon: Sparkles },
  { href: '/dashboard/idea-board', label: 'Idea Board', icon: LayoutGrid },
  { href: '/dashboard/pattern-analyzer', label: 'Pattern Analyzer', icon: Cpu },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <RepoFuseLogo className="h-40 w-full max-w-xl" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-foreground/10 text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.github_avatar_url && (
                  <img
                    src={user.github_avatar_url}
                    alt={user.github_username}
                    className="h-8 w-8 rounded-full ring-2 ring-border"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground leading-none">@{user.github_username}</p>
                  <a
                    href="/api/auth/logout"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/api/auth/github/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                >
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect GitHub</span>
                </Link>
                <Link
                  href="/api/auth/gitlab/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.6 6.15 12 0 .4 6.15a.88.88 0 0 0-.3 1.1l1.88 5.77H0v4.27h2.58l2.4 7.38a.88.88 0 0 0 .83.56h12.38a.88.88 0 0 0 .83-.56l2.4-7.38H24v-4.27h-2.08l1.88-5.77a.88.88 0 0 0-.28-1.1z"/>
                  </svg>
                  <span className="hidden sm:inline">Connect GitLab</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="md:hidden border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
