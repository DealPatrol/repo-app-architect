'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, Github, BarChart3, FolderGit2, Sparkles, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuthUser } from '@/lib/auth'

interface DashboardHeaderProps {
  user: AuthUser | null
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: BarChart3 },
  { href: '/dashboard/repositories', label: 'Repositories', icon: FolderGit2 },
  { href: '/dashboard/analyses', label: 'Analyses', icon: Sparkles },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
]

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Layers className="h-5 w-5 text-background" />
              </div>
              <span className="font-bold text-lg tracking-tight">RepoFuse</span>
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
              <Link
                href="/api/auth/github/login"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Connect GitHub</span>
              </Link>
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
