import type { MissingFileGap } from '@/lib/queries'

export interface GapMatrixPoint {
  gap: MissingFileGap
  impact: number // 0-100 (affects how many blueprints)
  effort: number // 0-100 (estimated hours normalized)
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface GapCategory {
  name: string
  color: string
  icon: string
}

export const gapCategories: Record<string, GapCategory> = {
  auth: { name: 'Authentication', color: 'bg-blue-500', icon: '🔐' },
  api: { name: 'API', color: 'bg-purple-500', icon: '🔌' },
  ui: { name: 'UI Components', color: 'bg-pink-500', icon: '🎨' },
  database: { name: 'Database', color: 'bg-green-500', icon: '🗄️' },
  utils: { name: 'Utilities', color: 'bg-yellow-500', icon: '🛠️' },
  config: { name: 'Configuration', color: 'bg-gray-500', icon: '⚙️' },
  other: { name: 'Other', color: 'bg-slate-500', icon: '📦' },
}

/**
 * Calculate impact score (0-100) based on:
 * - How many blueprints need this gap
 * - If it's a blocking dependency
 */
export function calculateImpactScore(gap: MissingFileGap, allGaps: MissingFileGap[]): number {
  let impact = 0

  // Blocking gaps have high impact
  if (gap.is_blocking) {
    impact += 40
  }

  // Count how many other gaps depend on this one
  const dependentCount = allGaps.filter(g =>
    g.dependencies.includes(gap.file_name)
  ).length

  impact += Math.min(dependentCount * 10, 40)

  // Complexity adds impact (harder to build = more strategic)
  const complexityImpact = {
    low: 0,
    medium: 10,
    high: 20,
  }
  impact += complexityImpact[gap.complexity]

  return Math.min(impact, 100)
}

/**
 * Calculate effort score (0-100) based on estimated hours
 * Normalized to account for typical project ranges (0-40 hours)
 */
export function calculateEffortScore(gap: MissingFileGap): number {
  const maxHours = 40
  const score = (gap.estimated_hours / maxHours) * 100
  return Math.min(score, 100)
}

/**
 * Determine priority based on impact vs effort
 */
export function getPriority(impact: number, effort: number): 'critical' | 'high' | 'medium' | 'low' {
  // Critical: high impact, low effort (quick wins)
  if (impact >= 60 && effort <= 30) return 'critical'

  // High: high impact (even if higher effort)
  if (impact >= 70) return 'high'

  // High: medium impact and low effort (good value)
  if (impact >= 40 && effort <= 25) return 'high'

  // Medium: moderate impact/effort balance
  if (impact >= 30) return 'medium'

  return 'low'
}

/**
 * Convert gaps into matrix points for visualization
 */
export function gapsToMatrixPoints(gaps: MissingFileGap[]): GapMatrixPoint[] {
  return gaps.map(gap => {
    const impact = calculateImpactScore(gap, gaps)
    const effort = calculateEffortScore(gap)
    const priority = getPriority(impact, effort)

    return {
      gap,
      impact,
      effort,
      priority,
    }
  })
}

/**
 * Group gaps by priority and category
 */
export function groupGapsByPriority(gaps: MissingFileGap[]): Record<string, MissingFileGap[]> {
  const grouped: Record<string, MissingFileGap[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  }

  const points = gapsToMatrixPoints(gaps)

  points.forEach(({ gap, priority }) => {
    grouped[priority].push(gap)
  })

  return grouped
}

/**
 * Calculate total effort hours for a set of gaps
 */
export function calculateTotalEffort(gaps: MissingFileGap[]): number {
  return gaps.reduce((sum, gap) => sum + gap.estimated_hours, 0)
}

/**
 * Get blocking dependencies tree for a gap
 */
export function getBlockingDependencies(gap: MissingFileGap, allGaps: MissingFileGap[]): MissingFileGap[] {
  const blocking: MissingFileGap[] = []

  gap.dependencies.forEach(depName => {
    const dep = allGaps.find(g => g.file_name === depName)
    if (dep) {
      blocking.push(dep)
    }
  })

  return blocking
}

/**
 * Get suggestions for which gaps to tackle first (parallel-buildable groups)
 */
export function getSuggestedBuildOrder(gaps: MissingFileGap[]): {
  immediate: MissingFileGap[] // No dependencies
  nextWave: MissingFileGap[] // Can be built after immediate
  deferrable: MissingFileGap[] // Low priority
} {
  const immediate: MissingFileGap[] = []
  const nextWave: MissingFileGap[] = []
  const deferrable: MissingFileGap[] = []

  const points = gapsToMatrixPoints(gaps)
  const gapsByPriority = groupGapsByPriority(gaps)

  // Immediate: critical/high priority with no dependencies or low dependencies
  gapsByPriority.critical.forEach(gap => {
    if (gap.dependencies.length === 0) {
      immediate.push(gap)
    } else {
      nextWave.push(gap)
    }
  })

  gapsByPriority.high.forEach(gap => {
    if (gap.dependencies.length === 0) {
      immediate.push(gap)
    } else {
      nextWave.push(gap)
    }
  })

  // Next wave: medium priority
  nextWave.push(...gapsByPriority.medium)

  // Deferrable: low priority
  deferrable.push(...gapsByPriority.low)

  return {
    immediate,
    nextWave,
    deferrable,
  }
}
