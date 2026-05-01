import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

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
    analyses_per_month: 3,
    repos_limit: 5,
    price_monthly: 0,
  },
  pro: {
    name: 'Pro',
    analyses_per_month: -1,
    repos_limit: -1,
    price_monthly: 19,
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPriceId(): string {
  return process.env.STRIPE_PRO_PRICE_ID || ''
}
