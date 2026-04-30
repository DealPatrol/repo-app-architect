import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { z } from 'zod'
import { getAnthropicModel } from './anthropic-model'

export type AIProvider = 'anthropic' | 'openai'

export const AI_PROVIDERS: { id: AIProvider; name: string; description: string }[] = [
  { id: 'anthropic', name: 'Claude (Anthropic)', description: 'Claude Sonnet — strong at code analysis and structured reasoning' },
  { id: 'openai', name: 'GPT (OpenAI)', description: 'GPT-4o — fast, broad knowledge, great at pattern recognition' },
]

export function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = []
  if (process.env.ANTHROPIC_API_KEY) available.push('anthropic')
  if (process.env.OPENAI_API_KEY) available.push('openai')
  return available
}

const complexityEnum = z.preprocess((val) => {
  if (typeof val !== 'string') return val
  const v = val.trim().toLowerCase()
  if (v === 'easy') return 'simple'
  return v
}, z.enum(['simple', 'moderate', 'complex']))

const BlueprintSchema = z.object({
  name: z.string(),
  description: z.string(),
  app_type: z.string(),
  complexity: complexityEnum,
  reuse_percentage: z.number().min(0).max(100),
  existing_files: z.array(z.object({ path: z.string(), purpose: z.string() })),
  missing_files: z.array(z.object({ name: z.string(), purpose: z.string() })),
  technologies: z.array(z.string()),
  explanation: z.string(),
})

const AnalysisOutputSchema = z.object({
  blueprints: z.array(BlueprintSchema),
})

export type AnalysisBlueprint = z.infer<typeof BlueprintSchema>

const SYSTEM_PROMPT = 'You are an expert software architect. Your job is to analyze GitHub repository file structures and identify what new applications can be built by combining and reusing the existing code. Focus on practical, buildable applications based on actual code patterns.'

function buildUserPrompt(fileSummary: string): string {
  return `You are acting as an expert software architect and product strategist.
Analyze these files from GitHub repositories and discover what applications can be built by combining and reusing the existing code.

REPOSITORIES AND FILES:
${fileSummary}

Identify 3-6 practical applications that match these buckets:
1) Quick wins (ship-ready or very close),
2) Missing only a few files,
3) Larger but still feasible foundations.

For each app blueprint:
- Give it a clear, descriptive name
- Describe what the app does
- Estimate complexity (simple/moderate/complex)
- Calculate reuse percentage (how much existing code can be reused) and be realistic
- List existing files that can be reused (with their purpose); prefer highest-value files
- List missing files needed (with their purpose)
- For missing_files.name, provide concrete file paths (e.g. "app/api/billing/route.ts")
- List technologies detected
- Provide a brief explanation of why this app is possible, including a suggested first build step

Constraints:
- Use ONLY evidence from the provided files; do not invent major subsystems.
- Prefer opportunities that combine code across multiple repositories where possible.
- Keep missing_files concise and implementation-oriented.
- Avoid duplicate ideas that differ only by naming.
- Focus on practical, buildable applications based on the actual code patterns you see.

Return your response as a JSON object with a "blueprints" array.`
}

const TOOL_SCHEMA = {
  name: 'report_blueprints',
  description: 'Report the discovered app blueprints based on repository file analysis',
  input_schema: {
    type: 'object' as const,
    properties: {
      blueprints: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Clear, descriptive name for the app' },
            description: { type: 'string', description: 'What the app does' },
            app_type: { type: 'string', description: 'Type of application' },
            complexity: { type: 'string', enum: ['simple', 'moderate', 'complex'] },
            reuse_percentage: { type: 'number', minimum: 0, maximum: 100 },
            existing_files: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, purpose: { type: 'string' } }, required: ['path', 'purpose'] } },
            missing_files: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, purpose: { type: 'string' } }, required: ['name', 'purpose'] } },
            technologies: { type: 'array', items: { type: 'string' } },
            explanation: { type: 'string' },
          },
          required: ['name', 'description', 'app_type', 'complexity', 'reuse_percentage', 'existing_files', 'missing_files', 'technologies', 'explanation'],
        },
      },
    },
    required: ['blueprints'],
  },
}

async function analyzeWithAnthropic(fileSummary: string): Promise<AnalysisBlueprint[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const aiResponse = await client.messages.create({
    model: getAnthropicModel(),
    max_tokens: 4096,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [TOOL_SCHEMA],
    tool_choice: { type: 'tool', name: 'report_blueprints' },
    messages: [{ role: 'user', content: buildUserPrompt(fileSummary) }],
  })

  let toolUseBlock = aiResponse.content.find(
    (block) => block.type === 'tool_use' && 'name' in block && (block as { name: string }).name === 'report_blueprints',
  )
  if (!toolUseBlock) {
    toolUseBlock = aiResponse.content.find((block) => block.type === 'tool_use')
  }
  const rawInput = toolUseBlock?.type === 'tool_use' ? toolUseBlock.input : null
  const parsed = rawInput ? AnalysisOutputSchema.safeParse(rawInput) : null

  if (rawInput && !parsed?.success) {
    console.error('[anthropic] Blueprint schema validation failed:', parsed?.error?.flatten())
  }

  return parsed?.success ? parsed.data.blueprints : []
}

async function analyzeWithOpenAI(fileSummary: string): Promise<AnalysisBlueprint[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const aiResponse = await client.chat.completions.create({
    model: process.env.OPENAI_ANALYSIS_MODEL?.trim() || 'gpt-4o',
    max_tokens: 4096,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + '\n\nAlways respond with valid JSON containing a "blueprints" array.' },
      { role: 'user', content: buildUserPrompt(fileSummary) },
    ],
  })

  const text = aiResponse.choices[0]?.message?.content
  if (!text) return []

  try {
    const parsed = AnalysisOutputSchema.safeParse(JSON.parse(text))
    if (!parsed.success) {
      console.error('[openai] Blueprint schema validation failed:', parsed.error.flatten())
      return []
    }
    return parsed.data.blueprints
  } catch (e) {
    console.error('[openai] Failed to parse JSON response:', e)
    return []
  }
}

export async function runAIAnalysis(
  fileSummary: string,
  provider: AIProvider,
): Promise<AnalysisBlueprint[]> {
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.')
    return analyzeWithOpenAI(fileSummary)
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured.')
  return analyzeWithAnthropic(fileSummary)
}
