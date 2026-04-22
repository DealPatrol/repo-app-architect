import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAccessToken } from '@/lib/auth'
import { listGitHubRepositories } from '@/lib/github'
import { createRepository } from '@/lib/queries'

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getCurrentAccessToken()
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated with GitHub' }, { status: 401 })
    }

    const body = await request.json()
    const repositoryIds = Array.isArray(body.repositoryIds) ? body.repositoryIds : []

    if (repositoryIds.length === 0) {
      return NextResponse.json({ error: 'At least one repository must be selected' }, { status: 400 })
    }

    const githubRepositories = await listGitHubRepositories(accessToken)
    const selectedRepositories = githubRepositories.filter((repo) => repositoryIds.includes(repo.id))

    if (selectedRepositories.length === 0) {
      return NextResponse.json({ error: 'Selected repositories were not found on GitHub' }, { status: 404 })
    }

    const imported = []

    for (const repo of selectedRepositories) {
      const saved = await createRepository({
        github_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.url,
        default_branch: repo.default_branch,
        language: repo.language,
        stars: repo.stars,
      })

      imported.push(saved)
    }

    return NextResponse.json({ imported, count: imported.length })
  } catch (error) {
    console.error('Error importing repositories:', error)
    return NextResponse.json({ error: 'Failed to import repositories' }, { status: 500 })
  }
}
