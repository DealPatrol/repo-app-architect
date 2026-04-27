'use client'

import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface CheckoutButtonProps {
  planId: string
  children?: React.ReactNode
  className?: string
}

export function CheckoutButton({ planId, children, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        setError(payload.error ?? 'Unable to start checkout.')
        return
      }

      window.location.href = payload.url
    } catch {
      setError('Unable to reach Stripe checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button className={className} size="lg" onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children ?? 'Upgrade with Stripe'}
        {!isLoading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
