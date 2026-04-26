import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Scaffold generation is not configured. Missing ANTHROPIC_API_KEY.' },
        { status: 503 },
      )
    }

    const { appName, description, technologies, existingFiles, missingFiles } = await request.json()

    if (!appName || !description || !technologies) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[v0] Generating scaffold for app:', appName)

    // Generate scaffold structure using Claude
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate a complete project scaffold for "${appName}".

Description: ${description}
Technologies: ${technologies.join(', ')}
Existing files available: ${existingFiles.join(', ')}
Missing files to generate: ${missingFiles.join(', ')}

Create a JSON structure with:
1. Project structure (folders and file paths)
2. package.json content
3. README.md content with setup instructions
4. .env.example content
5. For each missing file, provide the complete code

Return ONLY valid JSON with this structure:
{
  "structure": { "folder/file": "description" },
  "files": {
    "package.json": { "content": "..." },
    "README.md": "...",
    ".env.example": "...",
    "src/file.ts": "..."
  }
}`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON response
    let scaffold
    try {
      const raw = content.text.trim()
      const normalized = raw.startsWith('```')
        ? raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
        : raw
      scaffold = JSON.parse(normalized)
    } catch (e) {
      console.error('[v0] Failed to parse Claude response:', content.text)
      throw new Error('Failed to parse scaffold generation')
    }

    console.log('[v0] Scaffold generated successfully')

    return NextResponse.json({
      success: true,
      scaffold,
      appName,
    })
  } catch (error) {
    console.error('[v0] Scaffold generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate scaffold' },
      { status: 500 }
    )
  }
}
