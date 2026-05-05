import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID)
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  }
  return stripeInstance
}

export const PLANS = {
  free: {
    name: 'Free',
    analyses_per_month: 2,
    blueprints_viewable: 2,
    repos_limit: 5,
    price_monthly: 0,
    ai_provider: 'builtin' as const,
    description: 'View 2 blueprints',
  },
  byok: {
    name: 'BYOK',
    analyses_per_month: -1,
    blueprints_viewable: -1,
    repos_limit: -1,
    price_monthly: 9.99,
    ai_provider: 'user' as const,
    description: 'Bring your own API key',
  },
  pro: {
    name: 'Pro',
    analyses_per_month: -1,
    blueprints_viewable: -1,
    repos_limit: -1,
    price_monthly: 20,
    trial_days: 7,
    ai_provider: 'builtin' as const,
    description: '7 days free, then $20/mo',
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPriceId(): string {
  return process.env.STRIPE_PRO_PRICE_ID || ''
}
