'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CreditsDisplay } from '@/components/credits-display'
import {
  CreditCard,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  ExternalLink,
  Zap,
  Crown,
} from 'lucide-react'

interface BillingClientProps {
  plan: 'free' | 'pro'
  planName: string
  analysesUsed: number
  analysesLimit: number
  blueprintsUsed?: number
  blueprintsLimit?: number
  reposLimit: number
  status: string
  currentPeriodEnd: string | null
  hasStripeCustomer: boolean
  userId?: string
  isTrialing?: boolean
}

export function BillingClient({
  plan,
  planName,
  analysesUsed,
  analysesLimit,
  blueprintsUsed = 0,
  blueprintsLimit = 2,
  reposLimit,
  status,
  currentPeriodEnd,
  hasStripeCustomer,
  userId,
  isTrialing = false,
}: BillingClientProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const isPro = plan === 'pro'
  const usagePercent = analysesLimit > 0 ? Math.min(100, Math.round((analysesUsed / analysesLimit) * 100)) : 0

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch {
      alert('Failed to start checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open billing portal')
      }
    } catch {
      alert('Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-lg">Manage your subscription and usage</p>
      </div>

      {/* Current plan */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                {isPro ? (
                  <Crown className="h-5 w-5 text-chart-4" />
                ) : (
                  <Zap className="h-5 w-5 text-muted-foreground" />
                )}
                <h2 className="text-2xl font-bold text-foreground">{planName}</h2>
              </div>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === 'active' ? 'bg-chart-1/15 text-chart-1' :
              status === 'trialing' ? 'bg-chart-4/15 text-chart-4' :
              status === 'past_due' ? 'bg-destructive/15 text-destructive' :
              'bg-muted text-muted-foreground'
            }`}>
              {status === 'active' ? 'Active' :
               status === 'trialing' ? 'Trial' :
               status === 'past_due' ? 'Past Due' :
               'Canceled'}
            </span>
          </div>

          {isPro && currentPeriodEnd && (
            <p className="text-sm text-muted-foreground mb-4">
              Renews {new Date(currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-chart-1" />
              <span className="text-muted-foreground">
                {isPro ? 'Unlimited repositories' : `Up to ${reposLimit} repositories`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-chart-1" />
              <span className="text-muted-foreground">
                {isPro ? 'Unlimited analyses' : `${analysesLimit} analyses per month`}
              </span>
            </div>
            {isPro && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-chart-1" />
                  <span className="text-muted-foreground">Scaffold generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-chart-1" />
                  <span className="text-muted-foreground">Priority AI processing</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            {isPro && hasStripeCustomer ? (
              <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading} className="w-full">
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            ) : !isPro ? (
              <Button onClick={handleUpgrade} disabled={checkoutLoading} className="w-full shadow-lg shadow-primary/20">
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Upgrade to Pro — 7 days free, then $20/mo
              </Button>
            ) : null}
          </div>
        </Card>

        {/* Usage */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Usage This Month</h2>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Analyses</span>
                <span className="font-medium text-foreground">
                  {analysesUsed}{analysesLimit > 0 ? ` / ${analysesLimit}` : ' / ∞'}
                </span>
              </div>
              {analysesLimit > 0 ? (
                <Progress value={usagePercent} className="h-2" />
              ) : (
                <div className="h-2 rounded-full bg-chart-1/20">
                  <div className="h-full rounded-full bg-chart-1 w-0" />
                </div>
              )}
              {!isPro && analysesLimit > 0 && usagePercent >= 80 && (
                <p className="text-xs text-destructive mt-2">
                  {usagePercent >= 100
                    ? 'You\'ve reached your monthly limit.'
                    : 'Approaching your monthly limit.'}
                  {' '}
                  <button onClick={handleUpgrade} className="underline font-medium hover:no-underline">
                    Upgrade to Pro
                  </button>
                </p>
              )}
            </div>

            {/* Blueprint views for free users */}
            {!isPro && blueprintsLimit > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Blueprints Viewed</span>
                  <span className="font-medium text-foreground">
                    {blueprintsUsed} / {blueprintsLimit}
                  </span>
                </div>
                <Progress value={Math.min(100, Math.round((blueprintsUsed / blueprintsLimit) * 100))} className="h-2" />
                {blueprintsUsed >= blueprintsLimit && (
                  <p className="text-xs text-destructive mt-2">
                    You&apos;ve viewed all your free blueprints.{' '}
                    <button onClick={handleUpgrade} className="underline font-medium hover:no-underline">
                      Upgrade for unlimited
                    </button>
                  </p>
                )}
              </div>
            )}

            {!isPro && (
              <div className="rounded-xl border border-chart-1/20 bg-chart-1/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Unlock unlimited analyses</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pro gives you unlimited analyses, unlimited repos, scaffold generation, and priority AI.
                    </p>
                    <Button size="sm" className="mt-3" onClick={handleUpgrade} disabled={checkoutLoading}>
                      Upgrade Now
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Credits Section for Pro Users */}
      {isPro && userId && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Credits & Usage</h2>
            <p className="text-sm text-muted-foreground">Track your credits and see how they're used</p>
          </div>
          <CreditsDisplay userId={userId} />
        </div>
      )}

      {/* Compare plans */}
      {!isPro && (
        <div className="text-center pt-4">
          <Button variant="ghost" asChild>
            <Link href="/pricing">
              Compare all plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
