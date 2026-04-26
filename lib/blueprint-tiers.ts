import type { AppBlueprint } from '@/lib/queries'

/** How close the blueprint is to shippable, based on gaps vs reuse. */
export type BlueprintTier = 'ship_ready' | 'almost_there' | 'foundation'

export function getBlueprintTier(bp: AppBlueprint): BlueprintTier {
  const missing = bp.missing_files?.length ?? 0
  const reuse = bp.reuse_percentage ?? 0

  if (missing === 0) return 'ship_ready'
  if (missing <= 3 && reuse >= 55) return 'almost_there'
  if (missing <= 6) return 'almost_there'
  return 'foundation'
}

export const tierCopy: Record<
  BlueprintTier,
  { title: string; subtitle: string; badgeClass: string }
> = {
  ship_ready: {
    title: 'Ship-ready wins',
    subtitle:
      'You already have the pieces wired — these are the fastest paths to production.',
    badgeClass: 'bg-chart-1/20 text-chart-1 border-chart-1/40',
  },
  almost_there: {
    title: 'Almost there',
    subtitle:
      'Only a handful of files stand between you and launch. Generate stubs or knock them out in one session.',
    badgeClass: 'bg-chart-4/25 text-chart-4 border-chart-4/40',
  },
  foundation: {
    title: 'Strong foundation',
    subtitle:
      'Reuse is solid but more glue is needed — still quicker than starting from scratch because the core is yours.',
    badgeClass: 'bg-chart-5/25 text-chart-5 border-chart-5/40',
  },
}
