'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatTokenCount, formatCost } from '@/lib/token-budget'
import { AlertCircle, Zap } from 'lucide-react'

interface TokenTrackerProps {
  plan: 'free' | 'byok' | 'pro'
  monthlyTokensUsed: number
  monthlyTokensLimit: number
  estimatedCost?: number
}

export function TokenTracker({
  plan,
  monthlyTokensUsed,
  monthlyTokensLimit,
  estimatedCost,
}: TokenTrackerProps) {
  const percentUsed = (monthlyTokensUsed / monthlyTokensLimit) * 100
  const isWarning = percentUsed > 80

  return (
    <Card className="p-4 border-border">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Token Usage
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatTokenCount(monthlyTokensUsed)} of {formatTokenCount(monthlyTokensLimit)}{' '}
              monthly
            </p>
          </div>
          {estimatedCost && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated cost</p>
              <p className="text-lg font-semibold">{formatCost(estimatedCost)}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Progress
            value={Math.min(percentUsed, 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {percentUsed.toFixed(0)}% used this month
          </p>
        </div>

        {isWarning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">
              You&apos;re nearing your monthly token limit. Consider upgrading or managing usage.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
