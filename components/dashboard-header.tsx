'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, ChevronDown, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RepoFuseLogo3D } from '@/components/repofuse-logo-3d'
import type { AuthUser } from '@/lib/auth'
import {
  PRIMARY_DASHBOARD_NAV,
  SECONDARY_DASHBOARD_NAV,
  type DashboardNavItem,
} from '@/lib/dashboard-nav'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  user: AuthUser | null
}

function isNavActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/dashboard/templates/browse') {
    return pathname.startsWith('/dashboard/templates')
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLink({
  item,
  pathname,
  compact,
}: {
  item: DashboardNavItem
  pathname: string
  compact?: boolean
}) {
  const active = isNavActive(pathname, item.href)
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200',
        compact ? 'px-3.5 py-2 whitespace-nowrap' : 'px-3 py-2',
        active
          ? 'bg-cyan-500/15 text-cyan-300 shadow-sm ring-1 ring-cyan-500/20'
          : 'text-muted-foreground hover:text-cyan-200 hover:bg-cyan-950/30',
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
      {item.isPro && (
        <Lock className="h-3 w-3 text-orange-400/80 shrink-0" aria-label="Pro feature" />
      )}
    </Link>
  )
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()
  const secondaryActive = SECONDARY_DASHBOARD_NAV.some((item) => isNavActive(pathname, item.href))

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <Link href="/" className="flex items-center shrink-0">
              <RepoFuseLogo3D className="h-10 w-10" />
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5 min-w-0">
              {PRIMARY_DASHBOARD_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-1 font-medium',
                      secondaryActive
                        ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20'
                        : 'text-muted-foreground hover:text-cyan-200 hover:bg-cyan-950/30',
                    )}
                  >
                    More
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 border-cyan-500/20">
                  <DropdownMenuLabel className="text-xs font-mono uppercase tracking-widest text-cyan-500/80">
                    Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SECONDARY_DASHBOARD_NAV.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.isPro && <Lock className="h-3 w-3 text-orange-400" />}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {user.github_avatar_url && (
                  <img
                    src={user.github_avatar_url}
                    alt={user.github_username}
                    className="h-8 w-8 rounded-full ring-2 ring-cyan-500/30"
                  />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground leading-none">@{user.github_username}</p>
                  <a
                    href="/api/auth/logout"
                    className="text-xs text-muted-foreground hover:text-cyan-300 transition-colors"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/api/auth/github/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-cyan-200 hover:bg-cyan-950/30 transition-all"
                >
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect GitHub</span>
                </Link>
                <Link
                  href="/api/auth/gitlab/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-cyan-200 hover:bg-cyan-950/30 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M23.6 6.15 12 0 .4 6.15a.88.88 0 0 0-.3 1.1l1.88 5.77H0v4.27h2.58l2.4 7.38a.88.88 0 0 0 .83.56h12.38a.88.88 0 0 0 .83-.56l2.4-7.38H24v-4.27h-2.08l1.88-5.77a.88.88 0 0 0-.28-1.1z" />
                  </svg>
                  <span className="hidden sm:inline">Connect GitLab</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="xl:hidden border-b border-cyan-500/20 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2">
          {[...PRIMARY_DASHBOARD_NAV, ...SECONDARY_DASHBOARD_NAV].map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} compact />
          ))}
        </div>
      </nav>
    </>
  )
}
