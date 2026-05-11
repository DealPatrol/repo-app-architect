'use client'

import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RepoFuseLogo3D } from '@/components/repofuse-logo-3d'
import { NavDropdown } from '@/components/nav-dropdown'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo with text */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <RepoFuseLogo3D className="h-12 w-12" />
        </Link>
        
        <nav className="flex items-center gap-2 sm:gap-4">
          {/* Dashboard Dropdown - centered */}
          <NavDropdown />
          
          {/* Auth buttons - GitHub & GitLab */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="h-10 w-10 sm:h-10 sm:w-auto sm:px-4 bg-[#24292e] hover:bg-[#2f363d] text-white border border-gray-700 hover:border-gray-600 rounded-lg" 
              asChild
            >
              <Link href="/api/auth/github/login">
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">GitHub</span>
              </Link>
            </Button>
            <Button 
              size="sm" 
              className="h-10 w-10 sm:h-10 sm:w-auto sm:px-4 bg-[#fc6d26] hover:bg-[#e24329] text-white rounded-lg" 
              asChild
            >
              <Link href="/api/auth/gitlab/login">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.45.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.92.92 0 0 0 .33-1.024"/>
                </svg>
                <span className="hidden sm:inline ml-2">GitLab</span>
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
