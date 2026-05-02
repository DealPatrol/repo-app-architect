import { NextRequest, NextResponse } from 'next/server'
import {
  generateRelevanceGuidedCompletion,
  CodeSnippet,
  batchGenerateCompletions,
} from '@/lib/code-completion'

/**
 * POST /api/code-completion
 * Generates intelligent code completions using relevance-guided context selection
 *
 * Request body:
 * {
 *   incompleteCode: string - The incomplete code to complete
 *   codebaseSnippets?: CodeSnippet[] - Optional codebase examples (or use from DB)
 *   language?: string - Programming language (default: 'python')
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { incompleteCode, codebaseSnippets = [], language = 'python' } = body

    if (!incompleteCode || typeof incompleteCode !== 'string') {
      return NextResponse.json(
        { error: 'incompleteCode is required and must be a string' },
        { status: 400 }
      )
    }

    // TODO: In production, fetch codebaseSnippets from database if not provided
    // const snippets = codebaseSnippets.length > 0
    //   ? codebaseSnippets
    //   : await fetchSnippetsFromDb(language)

    const result = await generateRelevanceGuidedCompletion(
      incompleteCode,
      codebaseSnippets,
      language
    )

    return NextResponse.json({
      success: true,
      completion: result.completion,
      context: result.context,
      selectedSnippets: result.selectedSnippets.map((s) => ({
        name: s.name,
        path: s.path,
        relevanceScore: s.relevanceScore,
        matchedPatterns: s.matchedPatterns,
      })),
      steps: result.steps,
    })
  } catch (error) {
    console.error('[v0] Code completion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate completion',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/code-completion/batch
 * Generates completions for multiple code snippets in batch
 *
 * Request body:
 * {
 *   codeSnippets: string[] - Array of incomplete code snippets
 *   codebaseSnippets?: CodeSnippet[] - Optional codebase examples
 *   language?: string - Programming language (default: 'python')
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { codeSnippets = [], codebaseSnippets = [], language = 'python' } = body

    if (!Array.isArray(codeSnippets) || codeSnippets.length === 0) {
      return NextResponse.json(
        { error: 'codeSnippets is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    const results = await batchGenerateCompletions(
      codeSnippets,
      codebaseSnippets,
      language
    )

    const successful = results.filter((r) => r.success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful,
        failed,
      },
      results,
    })
  } catch (error) {
    console.error('[v0] Batch completion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process batch',
      },
      { status: 500 }
    )
  }
}
