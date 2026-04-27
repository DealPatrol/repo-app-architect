import type { AppBlueprint } from '@/lib/queries'

export function getOpportunityScore(bp: AppBlueprint): number {
  const missing = bp.missing_files?.length ?? 0
  const complexityPenalty =
    bp.complexity === 'simple' ? 0 : bp.complexity === 'moderate' ? 8 : 16
  return Math.round((bp.reuse_percentage ?? 0) - missing * 6 - complexityPenalty)
}

export function getExecutionRisk(bp: AppBlueprint): 'Low' | 'Medium' | 'High' {
  const missing = bp.missing_files?.length ?? 0
  if (bp.complexity === 'complex' || missing >= 8) return 'High'
  if (bp.complexity === 'moderate' || missing >= 4) return 'Medium'
  return 'Low'
}

export function getSuggestedFirstStep(bp: AppBlueprint): string {
  const firstGap = bp.missing_files?.[0]
  if (firstGap?.name) {
    return `Create ${firstGap.name} first and wire it to reused modules.`
  }
  if (bp.existing_files?.[0]?.path) {
    return `Start by composing around ${bp.existing_files[0].path} and validate the first end-to-end flow.`
  }
  return 'Start with the core user flow and add integration points one by one.'
}

