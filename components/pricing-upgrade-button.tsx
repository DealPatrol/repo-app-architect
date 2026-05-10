'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

export function PricingUpgradeButton() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
        setLoading(false)
      }
    } catch {
      alert('Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full shadow-lg shadow-primary/20"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : null}
      Start Pro Plan
      {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
    </Button>
  )
}
