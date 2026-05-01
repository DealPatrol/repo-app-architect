import { getCurrentUser } from '@/lib/auth'
import { getSubscriptionByGithubId } from '@/lib/queries'
import { PLANS } from '@/lib/stripe'
import { BillingClient } from '@/components/billing-client'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const user = await getCurrentUser()

  let subscription = null
  if (user) {
    try {
      subscription = await getSubscriptionByGithubId(user.github_id)
    } catch {
      // DB or table not available yet
    }
  }

  const plan = subscription?.plan === 'pro' ? 'pro' : 'free'
  const limits = PLANS[plan]

  return (
    <BillingClient
      plan={plan}
      planName={limits.name}
      analysesUsed={subscription?.analyses_used_this_month ?? 0}
      analysesLimit={limits.analyses_per_month}
      reposLimit={limits.repos_limit}
      status={subscription?.status ?? 'active'}
      currentPeriodEnd={subscription?.current_period_end ?? null}
      hasStripeCustomer={!!subscription?.stripe_customer_id}
    />
  )
}
