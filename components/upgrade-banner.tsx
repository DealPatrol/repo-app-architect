'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Crown, X } from 'lucide-react'

export function UpgradeBanner() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setVisible(true)
      // Clean the query param from the URL without triggering a navigation
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-chart-4/30 bg-chart-4/10 px-5 py-3.5">
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 text-chart-4 flex-shrink-0" />
        <p className="text-sm font-medium text-foreground">
          You&apos;re now on Pro — unlimited analyses and repositories are unlocked.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
