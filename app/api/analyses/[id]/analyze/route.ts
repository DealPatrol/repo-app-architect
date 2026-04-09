import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const { analysisId, selectedRepos } = await request.json()

    // Get all repo files from database
    const filesByRepo: { [key: string]: any[] } = {}
    
    for (const repo of selectedRepos) {
      // Fetch repo structure from GitHub API
      const files = await fetchRepoStructure(repo)
      filesByRepo[repo.name] = files
    }

    // Use AI to analyze cross-repo patterns
    const prompt = `You are an expert software architect analyzing code across multiple repositories.

Given these repositories with their file structures:
${Object.entries(filesByRepo).map(([name, files]) => 
  `${name}: ${files.map(f => f.path).join(', ')}`
).join('\n')}

Your task is to discover what applications could be built by combining files from these repositories. For each possible app, determine:
1. App Name
2. App Type (Web App, Mobile App, API, Library, etc.)
3. Description
4. Complete? (true/false - does it have 80%+ of needed files?)
5. Reuse Percentage (how much code can be reused)
6. Missing Files (if not complete)
7. Technologies Used
8. Difficulty Level (easy/medium/hard)
9. Fast Cash Label (if missing only 2-3 files)
10. Explanation

Return as JSON array of app suggestions. Focus on practical, buildable applications.`

    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt,
    })

    // Parse AI response and save suggestions
    let suggestions = []
    try {
      const jsonMatch = result.text.match(/\[[\s\S]*\]/)
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
      completeSuggestions: suggestions.filter((s: any) => s.is_complete).length,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze repositories' }, { status: 500 })
  }
}

async function fetchRepoStructure(repo: any): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
      {
        headers: {
          'Accept': 'application/vnd.github+json',
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.tree
      .filter((item: any) => item.type === 'blob')
      .slice(0, 100) // Limit to first 100 files
      .map((item: any) => ({
        path: item.path,
        size: item.size,
      }))
  } catch (error) {
    console.error('Error fetching repo structure:', error)
    return []
  }
}
