export const CODEVAULT_PRO_PLAN = {
  id: 'codevault-pro',
  slug: 'codevault-pro',
  name: 'CodeVault Pro',
  description: 'For builders turning existing repositories into shippable product plans.',
  priceLabel: '$29',
  unitAmount: 2900,
  currency: 'usd',
  interval: 'month',
  features: [
    'Unlimited repository blueprint exports',
    'Cross-repo app discovery workflows',
    'Priority scaffold generation queue',
    'Commercial usage for generated plans',
  ],
} as const

export function getPlanById(planId: string | undefined) {
  if (planId === CODEVAULT_PRO_PLAN.id) {
    return CODEVAULT_PRO_PLAN
  }

  return null
}
