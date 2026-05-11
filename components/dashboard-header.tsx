'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RepoFuseLogo3D } from '@/components/repofuse-logo-3d'
import { NavDropdown } from '@/components/nav-dropdown'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/lib/auth'

interface DashboardHeaderProps {
  user: AuthUser | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center group flex-shrink-0">
              <RepoFuseLogo3D className="h-10 w-10" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-xs font-mono tracking-widest uppercase transition-colors",
                  pathname === '/dashboard' 
                    ? "text-cyan-300" 
                    : "text-cyan-400/60 hover:text-cyan-300"
                )}
              >
                Overview
              </Link>
              <Link 
                href="/pricing" 
                className={cn(
                  "text-xs font-mono tracking-widest uppercase transition-colors",
                  pathname === '/pricing' 
                    ? "text-cyan-300" 
                    : "text-cyan-400/60 hover:text-cyan-300"
                )}
              >
                Pricing
              </Link>
              
              {/* Features Dropdown */}
              <NavDropdown />
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
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
                  <p className="text-sm font-medium text-white leading-none">@{user.github_username}</p>
                  <a
                    href="/api/auth/logout"
                    className="text-xs text-cyan-400/60 hover:text-cyan-300 transition-colors"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden border-b border-cyan-500/10 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2">
          <Link
            href="/dashboard"
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest uppercase whitespace-nowrap transition-all',
              pathname === '/dashboard'
                ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                : 'text-cyan-400/60 hover:text-cyan-300',
            )}
          >
            Overview
          </Link>
          <Link
            href="/pricing"
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest uppercase whitespace-nowrap transition-all',
              pathname === '/pricing'
                ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30'
                : 'text-cyan-400/60 hover:text-cyan-300',
            )}
          >
            Pricing
          </Link>
          <NavDropdown />
        </div>
      </nav>
    </>
  )
}
