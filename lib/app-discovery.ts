import { Anthropic } from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export interface DiscoveredApp {
  name: string
  description: string
  type: string
  reusablePercentage: number
  missingFiles: string[]
  existingFiles: string[]
  estimatedBuildTime: string
  technologies: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
  fastCashLabel?: string
}

export async function discoverApps(scannedFiles: any[]): Promise<DiscoveredApp[]> {
  if (scannedFiles.length === 0) {
    return []
  }

  const filesList = scannedFiles
    .map((f) => `- ${f.path} (${f.language}, purpose: ${f.purpose}, reusability: ${f.reusabilityScore}/10)`)
    .join('\n')

  const prompt = `You are an expert software architect. Given this list of files from a developer's codebase across multiple platforms, identify 8-12 complete applications they could build by combining existing files and writing minimal new code.

Files available:
${filesList}

For each app, provide:
1. App name
2. Description (1-2 sentences)
3. Type (SaaS, Tool, Dashboard, API, etc)
4. List of existing files to reuse
5. Missing files needed (max 3)
6. Estimated build time (1-3 hours, 4-8 hours, 1-2 days, etc)
7. Core technologies required
8. Difficulty level (easy, medium, hard)
9. Why this is a good idea given their codebase
10. If missing ≤ 2 files, add a "QUICK WIN" label

Format as JSON array with objects containing these fields.`

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    // Extract JSON from response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const appsData = JSON.parse(jsonMatch[0])

    return appsData.map((app: any) => ({
      name: app['App name'] || app.name,
      description: app.Description || app.description,
      type: app.Type || app.type,
      reusablePercentage: calculateReusablePercentage(
        app['Existing files'] || app.existingFiles || [],
        app['Missing files'] || app.missingFiles || []
      ),
      missingFiles: app['Missing files'] || app.missingFiles || [],
      existingFiles: app['Existing files'] || app.existingFiles || [],
      estimatedBuildTime: app['Estimated build time'] || app.estimatedBuildTime,
      technologies: app['Core technologies'] || app.technologies || [],
      difficulty: (app['Difficulty level'] || app.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
      explanation: app['Why this is a good idea'] || app.explanation || '',
      fastCashLabel: (app['Missing files'] || app.missingFiles || []).length <= 2 ? 'QUICK WIN' : undefined,
    }))
  } catch (error) {
    console.error('[v0] Error parsing Claude response:', content.text, error)
    return []
  }
}

function calculateReusablePercentage(existing: any[], missing: any[]): number {
  const total = existing.length + missing.length
  if (total === 0) return 0
  return Math.round((existing.length / total) * 100)
}
