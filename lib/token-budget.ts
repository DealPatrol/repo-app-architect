/**
 * Performance & token budget optimization
 */

export interface TokenBudget {
  plan: 'free' | 'byok' | 'pro'
  monthly_limit: number
  per_analysis_limit: number
  model_for_scan: string // Cheaper model for initial scans
  model_for_final: string // Better model for final blueprints
}

export const TOKEN_BUDGETS: Record<'free' | 'byok' | 'pro', TokenBudget> = {
  free: {
    plan: 'free',
    monthly_limit: 50000,
    per_analysis_limit: 15000,
    model_for_scan: 'claude-opus-4.1', // Using same model due to free tier limitations
    model_for_final: 'claude-opus-4.1',
  },
  byok: {
    plan: 'byok',
    monthly_limit: 1000000, // User pays for their own tokens
    per_analysis_limit: 100000,
    model_for_scan: 'gpt-4o-mini', // Cheap scanning model
    model_for_final: 'gpt-4o', // Better final analysis
  },
  pro: {
    plan: 'pro',
    monthly_limit: 500000,
    per_analysis_limit: 50000,
    model_for_scan: 'claude-3.5-sonnet', // Balanced model
    model_for_final: 'claude-opus-4.1', // Premium for final
  },
}

/**
 * Estimate tokens for an analysis based on repo size
 */
export function estimateTokensNeeded(fileCount: number, avgFileSize: number): number {
  // Rough estimation: ~4 tokens per word, assume ~250 words per file metadata
  const tokensPerFile = Math.ceil(avgFileSize / 4)
  const baseTokens = fileCount * tokensPerFile
  const overheadMultiplier = 1.2 // 20% overhead for prompts

  return Math.ceil(baseTokens * overheadMultiplier)
}

/**
 * Get recommended model for the task
 */
export function getRecommendedModel(
  plan: 'free' | 'byok' | 'pro',
  stage: 'scan' | 'final'
): string {
  const budget = TOKEN_BUDGETS[plan]
  return stage === 'scan' ? budget.model_for_scan : budget.model_for_final
}

/**
 * Check if user has enough tokens for the analysis
 */
export function hasEnoughTokens(
  plan: 'free' | 'byok' | 'pro',
  tokensUsed: number,
  monthlyTokensUsed: number
): boolean {
  const budget = TOKEN_BUDGETS[plan]

  // Check per-analysis limit
  if (tokensUsed > budget.per_analysis_limit) {
    return false
  }

  // Check monthly limit
  if (monthlyTokensUsed + tokensUsed > budget.monthly_limit) {
    return false
  }

  return true
}

/**
 * Calculate cost estimate for an analysis
 */
export function calculateCostEstimate(
  estimatedTokens: number,
  provider: 'builtin' | 'anthropic' | 'openai' | 'grok' | 'deepinfra'
): { input_cost: number; output_cost: number; total_cost: number } {
  // Assume 70% input tokens, 30% output tokens
  const inputTokens = Math.round(estimatedTokens * 0.7)
  const outputTokens = Math.round(estimatedTokens * 0.3)

  const costs: Record<string, { input: number; output: number }> = {
    builtin: { input: 0.003, output: 0.015 }, // Claude Opus - in dollars per 1k tokens
    anthropic: { input: 0.003, output: 0.015 },
    openai: { input: 0.0025, output: 0.01 },
    grok: { input: 0.0005, output: 0.0015 },
    deepinfra: { input: 0.00014, output: 0.00028 },
  }

  const cost = costs[provider] || costs.builtin
  const input_cost = (inputTokens / 1000) * cost.input
  const output_cost = (outputTokens / 1000) * cost.output

  return {
    input_cost,
    output_cost,
    total_cost: input_cost + output_cost,
  }
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return `${tokens} tokens`
  return `${(tokens / 1000).toFixed(1)}k tokens`
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) return `<$0.01`
  return `$${cost.toFixed(2)}`
}
