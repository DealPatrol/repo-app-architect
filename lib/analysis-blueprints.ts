import { z } from 'zod'

export const BlueprintSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  app_type: z.string(),
  complexity: z.enum(['simple', 'moderate', 'complex']),
  reuse_percentage: z.number().min(0).max(100),
  existing_files: z.array(z.object({
    path: z.string().min(1),
    purpose: z.string(),
  })),
  missing_files: z.array(z.object({
    name: z.string().min(1),
    purpose: z.string(),
  })),
  technologies: z.array(z.string()),
  explanation: z.string(),
})

export const AnalysisOutputSchema = z.object({
  blueprints: z.array(BlueprintSchema).min(1),
})

export type AnalysisBlueprint = z.infer<typeof BlueprintSchema>
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>

export class BlueprintParseError extends Error {
  constructor(message = 'AI returned blueprints in an unexpected shape. Try again or set ANTHROPIC_ANALYSIS_MODEL to a supported Claude model.') {
    super(message)
    this.name = 'BlueprintParseError'
  }
}

export function getAnthropicAnalysisModel(): string {
  const model = process.env.ANTHROPIC_ANALYSIS_MODEL?.trim() || 'claude-3-5-sonnet-20241022'
  if (!model.startsWith('claude-')) {
    throw new Error('ANTHROPIC_ANALYSIS_MODEL must be a supported Claude model name.')
  }
  return model
}

export function parseAnalysisBlueprintOutput(text: string): AnalysisOutput {
  for (const candidate of getJsonCandidates(text)) {
    const parsed = safeJsonParse(candidate)
    if (parsed.ok) {
      const normalized = normalizeBlueprintResponse(parsed.value)
      if (normalized) return normalized
    }
  }

  throw new BlueprintParseError()
}

export function normalizeBlueprintResponse(value: unknown): AnalysisOutput | null {
  const rawBlueprints = getBlueprintArray(value)
  if (!rawBlueprints) return null

  const blueprints = rawBlueprints
    .map(normalizeBlueprint)
    .filter((blueprint): blueprint is AnalysisBlueprint => blueprint !== null)

  if (blueprints.length === 0) return null

  const result = AnalysisOutputSchema.safeParse({ blueprints })
  return result.success ? result.data : null
}

function getBlueprintArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value
  if (!isRecord(value)) return null

  for (const key of ['blueprints', 'apps', 'applications', 'suggestions', 'elements']) {
    const child = value[key]
    if (Array.isArray(child)) return child
  }

  for (const key of ['result', 'output', 'data']) {
    const nested = getBlueprintArray(value[key])
    if (nested) return nested
  }

  return null
}

function normalizeBlueprint(value: unknown): AnalysisBlueprint | null {
  if (!isRecord(value)) return null

  const name = getString(value, ['name', 'app_name', 'appName', 'App name'])
  if (!name) return null

  const existingFiles = normalizeExistingFiles(getArray(value, ['existing_files', 'existingFiles', 'Existing files', 'files_to_reuse', 'filesToReuse']))
  const missingFiles = normalizeMissingFiles(getArray(value, ['missing_files', 'missingFiles', 'Missing files', 'required_files', 'requiredFiles']))
  const reusePercentage = getNumber(value, ['reuse_percentage', 'reusePercentage', 'reusablePercentage', 'completionPercentage', 'reuse'])
    ?? calculateReusePercentage(existingFiles.length, missingFiles.length)

  const blueprint = {
    name,
    description: getString(value, ['description', 'Description']) || 'No description provided.',
    app_type: getString(value, ['app_type', 'appType', 'type', 'Type', 'category']) || 'Application',
    complexity: normalizeComplexity(getString(value, ['complexity', 'difficulty', 'Difficulty level'])),
    reuse_percentage: clampPercentage(reusePercentage),
    existing_files: existingFiles,
    missing_files: missingFiles,
    technologies: normalizeStringArray(getArray(value, ['technologies', 'Core technologies', 'tech_stack', 'techStack'])),
    explanation: getString(value, ['explanation', 'ai_explanation', 'reasoning', 'Why this is a good idea']) || '',
  }

  const result = BlueprintSchema.safeParse(blueprint)
  return result.success ? result.data : null
}

function normalizeExistingFiles(files: unknown[]): AnalysisBlueprint['existing_files'] {
  return files.map((file) => {
    if (typeof file === 'string') {
      return { path: file, purpose: 'Reusable existing file' }
    }
    if (isRecord(file)) {
      const path = getString(file, ['path', 'name', 'file', 'filename'])
      if (!path) return null
      return {
        path,
        purpose: getString(file, ['purpose', 'description', 'reason']) || 'Reusable existing file',
      }
    }
    return null
  }).filter((file): file is AnalysisBlueprint['existing_files'][number] => file !== null)
}

function normalizeMissingFiles(files: unknown[]): AnalysisBlueprint['missing_files'] {
  return files.map((file) => {
    if (typeof file === 'string') {
      return { name: file, purpose: 'Implementation needed' }
    }
    if (isRecord(file)) {
      const name = getString(file, ['name', 'path', 'file', 'filename'])
      if (!name) return null
      return {
        name,
        purpose: getString(file, ['purpose', 'description', 'reason']) || 'Implementation needed',
      }
    }
    return null
  }).filter((file): file is AnalysisBlueprint['missing_files'][number] => file !== null)
}

function getJsonCandidates(text: string): string[] {
  const trimmed = text.trim()
  const candidates = [trimmed]

  for (const match of trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    candidates.push(match[1].trim())
  }

  candidates.push(...extractBalancedJson(trimmed))
  return [...new Set(candidates.filter(Boolean))]
}

function extractBalancedJson(text: string): string[] {
  const candidates: string[] = []
  const stack: string[] = []
  let start = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
    } else if (char === '{' || char === '[') {
      if (stack.length === 0) start = i
      stack.push(char)
    } else if (char === '}' || char === ']') {
      const opener = stack.pop()
      if ((char === '}' && opener !== '{') || (char === ']' && opener !== '[')) {
        stack.length = 0
        start = -1
        continue
      }
      if (stack.length === 0 && start >= 0) {
        candidates.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }

  return candidates
}

function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch {
    return { ok: false }
  }
}

function getString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function getNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  }
  return null
}

function getArray(record: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function normalizeStringArray(values: unknown[]): string[] {
  return values
    .map((value) => typeof value === 'string' ? value.trim() : null)
    .filter((value): value is string => Boolean(value))
}

function normalizeComplexity(value: string | null): AnalysisBlueprint['complexity'] {
  const normalized = value?.toLowerCase()
  if (normalized === 'simple' || normalized === 'easy' || normalized === 'low') return 'simple'
  if (normalized === 'complex' || normalized === 'hard' || normalized === 'high') return 'complex'
  return 'moderate'
}

function calculateReusePercentage(existingCount: number, missingCount: number): number {
  const total = existingCount + missingCount
  return total === 0 ? 0 : Math.round((existingCount / total) * 100)
}

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
