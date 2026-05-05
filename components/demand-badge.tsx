'use client'

import { Flame, TrendingUp, Sparkles } from 'lucide-react'

interface DemandBadgeProps {
  demandScore: number
  className?: string
}

export function DemandBadge({ demandScore, className = '' }: DemandBadgeProps) {
  if (demandScore >= 75) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-medium ${className}`}>
        <Flame className="h-3.5 w-3.5" />
        High Demand
      </div>
    )
  }

  if (demandScore >= 50) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-medium ${className}`}>
        <TrendingUp className="h-3.5 w-3.5" />
        Growing
      </div>
    )
  }

  if (demandScore >= 25) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium ${className}`}>
        <Sparkles className="h-3.5 w-3.5" />
        Emerging
      </div>
    )
  }

  return null
}
