import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicModel } from '@/lib/anthropic-model'

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
    console.log('[v0] Calling Claude with model:', getAnthropicModel())

    // Generate scaffold structure using Claude
    const response = await client.messages.create({
      model: getAnthropicModel(),
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Generate a complete project scaffold for "${appName}".

Description: ${description}
Technologies: ${technologies.join(', ')}
Existing files available: ${existingFiles.join(', ')}
Missing files to generate: ${missingFiles.join(', ')}

Create a JSON object with:
1. "structure": Object mapping folder/file paths to descriptions
2. "files": Object with file paths as keys and content objects/strings as values
   - "package.json": Object with package.json content
   - "README.md": String with markdown content
   - ".env.example": String with env vars
   - Other files: String with complete code

IMPORTANT: 
- Return ONLY valid JSON, no markdown, no extra text
- All strings must use proper JSON escaping
- No trailing commas
- All quoted keys and values

Example structure:
{
  "structure": {
    "src": "Source files",
    "src/index.ts": "Entry point"
  },
  "files": {
    "package.json": {"name": "app", "version": "1.0.0"},
    "README.md": "# App\\n\\nDescription here",
    "src/index.ts": "// TODO: implement main logic\\nconsole.log('Hello')"
  }
}`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON response with better error handling
    let scaffold
    try {
      const raw = content.text.trim()
      
      console.log('[v0] Raw Claude response length:', raw.length)
      console.log('[v0] First 200 chars:', raw.substring(0, 200))
      
      // Extract JSON from various markdown formats
      let jsonStr = raw
      
      // Remove markdown code blocks
      if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (match && match[1]) {
          jsonStr = match[1].trim()
          console.log('[v0] Extracted JSON from markdown')
        }
      }
      
      // Try to find JSON object if there's extra text
      if (!jsonStr.startsWith('{')) {
        const objMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (objMatch) {
          jsonStr = objMatch[0]
          console.log('[v0] Extracted JSON object from text')
        }
      }
      
      console.log('[v0] JSON string to parse length:', jsonStr.length)
      
      // Parse JSON
      scaffold = JSON.parse(jsonStr)
      
      // Validate structure
      if (!scaffold.structure || !scaffold.files) {
        console.error('[v0] Invalid scaffold structure')
        throw new Error('Invalid scaffold structure - missing required fields (structure, files)')
      }
      
      console.log('[v0] Successfully parsed scaffold with', Object.keys(scaffold.structure).length, 'structure items')
    } catch (e) {
      console.error('[v0] Failed to parse Claude response:', {
        error: e instanceof Error ? e.message : String(e),
        rawContent: content.text.substring(0, 500),
      })
      throw new Error(`Failed to parse scaffold generation: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }

    console.log('[v0] Scaffold generated successfully')

    return NextResponse.json({
      success: true,
      scaffold,
      appName,
    })
  } catch (error) {
    console.error('[v0] Scaffold generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate scaffold'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
