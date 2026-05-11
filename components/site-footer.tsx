'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t border-cyan-500/20 bg-black/50 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-xs text-cyan-400/60">
              <li><Link href="/#features" className="hover:text-cyan-300 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-cyan-300 transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-300 transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Security</h4>
            <ul className="space-y-2 text-xs text-cyan-400/60">
              <li><Link href="/data-handling" className="hover:text-cyan-300 transition-colors">How We Handle Data</Link></li>
              <li><Link href="/data-handling#local" className="hover:text-cyan-300 transition-colors">Local Analysis (CLI)</Link></li>
              <li><Link href="/data-handling" className="hover:text-cyan-300 transition-colors">Security Protocols</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-xs text-cyan-400/60">
              <li><Link href="/privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3 text-sm">Connect</h4>
            <ul className="space-y-2 text-xs text-cyan-400/60">
              <li><a href="https://github.com/DealPatrol" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cyan-500/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-cyan-400/40 font-mono">
            © 2026 RepoFuse. Built by developers, for developers.
          </div>
          <div className="flex items-center gap-4 text-xs text-cyan-400/60">
            <Link href="/data-handling" className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
              <Shield className="h-3 w-3" />
              Your data is safe
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
