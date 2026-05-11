'use client'

import { useEffect, useState, useRef } from 'react'
import { Terminal, CheckCircle2, FileCode, FolderGit2, Zap, Database, Lock, Layout } from 'lucide-react'

interface ScanLine {
  id: number
  text: string
  type: 'scanning' | 'found' | 'analyzing' | 'complete' | 'info'
  icon?: typeof Terminal
}

// Simulated scan discoveries that feel real
const SCAN_PATTERNS = [
  { path: '/lib/auth', finding: 'JWT Authentication Logic', icon: Lock },
  { path: '/components', finding: 'UI Components', icon: Layout, count: true },
  { path: '/lib/db', finding: 'Database Connections', icon: Database },
  { path: '/api', finding: 'API Routes', icon: Zap, count: true },
  { path: '/hooks', finding: 'Custom React Hooks', icon: FileCode, count: true },
  { path: '/utils', finding: 'Utility Functions', icon: FileCode },
  { path: '/types', finding: 'TypeScript Definitions', icon: FileCode },
  { path: '/middleware', finding: 'Middleware Logic', icon: Zap },
  { path: '/config', finding: 'Configuration Files', icon: FolderGit2 },
  { path: '/lib/stripe', finding: 'Payment Integration', icon: Zap },
  { path: '/lib/email', finding: 'Email Service', icon: Zap },
  { path: '/components/ui', finding: 'UI Primitives', icon: Layout, count: true },
]

interface TerminalScannerProps {
  isActive: boolean
  repoName?: string
  totalFiles?: number
  analyzedFiles?: number
  onComplete?: () => void
}

export function TerminalScanner({ 
  isActive, 
  repoName = 'repository',
  totalFiles = 0,
  analyzedFiles = 0,
  onComplete 
}: TerminalScannerProps) {
  const [lines, setLines] = useState<ScanLine[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const terminalRef = useRef<HTMLDivElement>(null)
  const lineIdRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      setLines([])
      setCurrentIndex(0)
      return
    }

    // Initial line
    setLines([{
      id: lineIdRef.current++,
      text: `Initializing scan for ${repoName}...`,
      type: 'info'
    }])

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1
        
        if (nextIndex >= SCAN_PATTERNS.length) {
          clearInterval(interval)
          // Add completion line
          setTimeout(() => {
            setLines(l => [...l, {
              id: lineIdRef.current++,
              text: 'Scan complete. Generating blueprints...',
              type: 'complete',
              icon: CheckCircle2
            }])
            onComplete?.()
          }, 500)
          return prev
        }

        const pattern = SCAN_PATTERNS[nextIndex]
        const count = pattern.count ? Math.floor(Math.random() * 20) + 5 : null

        // Add scanning line
        setLines(l => [...l, {
          id: lineIdRef.current++,
          text: `Scanning ${pattern.path}...`,
          type: 'scanning'
        }])

        // Add found line after short delay
        setTimeout(() => {
          setLines(l => [...l, {
            id: lineIdRef.current++,
            text: count 
              ? `Found: ${pattern.finding} (${count} files)` 
              : `Found: ${pattern.finding}`,
            type: 'found',
            icon: pattern.icon
          }])
        }, 300)

        return nextIndex
      })
    }, 800)

    return () => clearInterval(interval)
  }, [isActive, repoName, onComplete])

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  if (!isActive && lines.length === 0) return null

  return (
    <div className="rounded-lg border border-cyan-500/30 bg-black/80 overflow-hidden font-mono text-sm">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/20 bg-cyan-950/20">
        <Terminal className="h-4 w-4 text-cyan-400" />
        <span className="text-cyan-300 text-xs">RepoFuse Scanner</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
      </div>

      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="p-4 h-64 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-cyan-500/20"
      >
        {lines.map((line) => {
          const Icon = line.icon || Terminal
          return (
            <div 
              key={line.id}
              className={`flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300 ${
                line.type === 'scanning' ? 'text-cyan-400/60' :
                line.type === 'found' ? 'text-cyan-300' :
                line.type === 'complete' ? 'text-green-400' :
                line.type === 'analyzing' ? 'text-orange-400' :
                'text-cyan-400/40'
              }`}
            >
              <span className="text-cyan-500/50 select-none">{'>'}</span>
              {line.type === 'found' && <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />}
              <span>{line.text}</span>
              {line.type === 'scanning' && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          )
        })}
        
        {isActive && currentIndex < SCAN_PATTERNS.length && (
          <div className="flex items-center gap-2 text-cyan-400/60">
            <span className="text-cyan-500/50 select-none">{'>'}</span>
            <span className="animate-pulse">_</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalFiles > 0 && (
        <div className="px-4 py-2 border-t border-cyan-500/20 bg-cyan-950/10">
          <div className="flex items-center justify-between text-xs text-cyan-400/60 mb-1">
            <span>Progress</span>
            <span>{analyzedFiles} / {totalFiles} files</span>
          </div>
          <div className="h-1.5 bg-cyan-950/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-orange-500 transition-all duration-500"
              style={{ width: `${totalFiles > 0 ? (analyzedFiles / totalFiles) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
