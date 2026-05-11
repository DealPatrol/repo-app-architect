'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertTriangle, FileCode, Zap, TrendingUp } from 'lucide-react'

interface CompletenessMeterProps {
  existingFiles: number
  missingFiles: number
  reusePercentage?: number
  categories?: {
    name: string
    existing: number
    missing: number
  }[]
}

export function CompletenessMeter({ 
  existingFiles, 
  missingFiles, 
  reusePercentage,
  categories = []
}: CompletenessMeterProps) {
  const totalFiles = existingFiles + missingFiles
  const completeness = totalFiles > 0 ? Math.round((existingFiles / totalFiles) * 100) : 0
  const displayReuse = reusePercentage ?? completeness

  // Determine status color based on completeness
  const statusColor = useMemo(() => {
    if (completeness >= 80) return { ring: 'stroke-green-500', fill: 'text-green-400', bg: 'bg-green-500/20' }
    if (completeness >= 60) return { ring: 'stroke-cyan-500', fill: 'text-cyan-400', bg: 'bg-cyan-500/20' }
    if (completeness >= 40) return { ring: 'stroke-yellow-500', fill: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { ring: 'stroke-orange-500', fill: 'text-orange-400', bg: 'bg-orange-500/20' }
  }, [completeness])

  // SVG circle parameters
  const size = 140
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (completeness / 100) * circumference

  return (
    <Card className="p-6 bg-black/60 border-cyan-500/30">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-cyan-950/50"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={`${statusColor.ring} transition-all duration-1000 ease-out`}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${statusColor.fill}`}>
              {displayReuse}%
            </span>
            <span className="text-xs text-cyan-400/60 uppercase tracking-wider">
              Reusable
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Product Completeness</h3>
            <p className="text-sm text-cyan-200/60">
              {existingFiles} files can be reused, {missingFiles} need to be created
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <div>
                <div className="text-lg font-bold text-white">{existingFiles}</div>
                <div className="text-xs text-cyan-400/60">Existing</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-950/30 border border-orange-500/20">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-lg font-bold text-white">{missingFiles}</div>
                <div className="text-xs text-orange-400/60">Missing</div>
              </div>
            </div>
          </div>

          {/* Category breakdown if provided */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-cyan-400/60 uppercase tracking-wider">By Category</h4>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catTotal = cat.existing + cat.missing
                  const catPercent = catTotal > 0 ? Math.round((cat.existing / catTotal) * 100) : 0
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-300">{cat.name}</span>
                        <span className="text-cyan-400/60">{catPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-cyan-950/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom insight */}
      <div className="mt-6 pt-4 border-t border-cyan-500/20 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${statusColor.bg}`}>
          {completeness >= 60 ? (
            <TrendingUp className={`h-5 w-5 ${statusColor.fill}`} />
          ) : (
            <Zap className={`h-5 w-5 ${statusColor.fill}`} />
          )}
        </div>
        <div>
          <p className="text-sm text-white font-medium">
            {completeness >= 80 
              ? 'Excellent reuse potential! Most of your code is ready.' 
              : completeness >= 60 
                ? 'Good foundation. A few key files will complete this app.'
                : completeness >= 40
                  ? 'Solid start. Focus on the high-impact missing pieces first.'
                  : 'This app needs more work, but you have a starting point.'}
          </p>
          <p className="text-xs text-cyan-400/60 mt-1">
            Estimated time saved: ~{Math.round(existingFiles * 0.5)} hours of development
          </p>
        </div>
      </div>
    </Card>
  )
}

// Compact version for lists/cards
export function CompletenessBar({ 
  percentage, 
  size = 'default' 
}: { 
  percentage: number
  size?: 'sm' | 'default' 
}) {
  const color = percentage >= 80 ? 'from-green-500 to-green-400' :
                percentage >= 60 ? 'from-cyan-500 to-cyan-400' :
                percentage >= 40 ? 'from-yellow-500 to-yellow-400' :
                'from-orange-500 to-orange-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`font-bold ${size === 'sm' ? 'text-sm' : 'text-base'} text-white`}>
          {percentage}%
        </span>
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-cyan-400/60`}>
          reusable
        </span>
      </div>
      <div className={`${size === 'sm' ? 'h-1' : 'h-1.5'} bg-cyan-950/50 rounded-full overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
