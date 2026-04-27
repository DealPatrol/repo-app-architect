/** Default Claude model when ANTHROPIC_ANALYSIS_MODEL is unset (Anthropic Messages API ID). */
export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929'

export function getAnthropicModel(): string {
  return process.env.ANTHROPIC_ANALYSIS_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL
}
