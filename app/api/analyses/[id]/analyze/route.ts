import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('github_access_token')?.value

    const { analysisId, selectedRepos } = await request.json()

    if (!selectedRepos || selectedRepos.length === 0) {
      return NextResponse.json({ error: 'No repositories provided' }, { status: 400 })
    }

    const filesByRepo: { [key: string]: any[] } = {}

    for (const repo of selectedRepos) {
      const files = await fetchRepoStructure(repo, accessToken)
      filesByRepo[repo.name] = files
    }

    const repoSummary = Object.entries(filesByRepo)
      .map(([name, files]) => `${name}: ${files.map((f: any) => f.path).join(', ')}`)
      .join('\n')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert software architect analyzing code across multiple repositories.

Given these repositories with their file structures:
${repoSummary}

Discover what applications could be built by combining files from these repositories. Return a JSON array of app suggestions, each with: appName, appType, description, isComplete (bool), reusePercentage (number), missingFiles (array), technologies (array), difficultyLevel (easy/medium/hard), fastCashLabel (if missing only 2-3 files), explanation. Focus on practical, buildable applications.

Return only the JSON array with no surrounding text.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''

    let suggestions = []
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
    }

    return NextResponse.json({
      analysisId,
      suggestions,
      totalSuggestions: suggestions.length,
      completeSuggestions: suggestions.filter((s: any) => s.isComplete).length,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze repositories' }, { status: 500 })
  }
}

async function fetchRepoStructure(repo: any, accessToken?: string): Promise<any[]> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'CodeVault',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
      { headers }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.tree
      .filter((item: any) => item.type === 'blob')
      .slice(0, 100)
      .map((item: any) => ({
        path: item.path,
        size: item.size,
      }))
  } catch (error) {
    console.error('Error fetching repo structure:', error)
    return []
  }
}
