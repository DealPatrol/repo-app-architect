import { NextRequest, NextResponse } from 'next/server'
import { getAllRepositories, createRepository } from '@/lib/queries'

export async function GET() {
  try {
    const repositories = await getAllRepositories()
    return NextResponse.json(repositories)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // Parse GitHub URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i)
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })
    }

    const [, owner, repo] = match
    const repoName = repo.replace(/\.git$/, '')

    // Fetch repository info from GitHub API
    const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RepoFuse',
      },
    })

    if (!githubRes.ok) {
      if (githubRes.status === 404) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch repository from GitHub' }, { status: 500 })
    }

    const githubData = await githubRes.json()

    // Save to database
    const repository = await createRepository({
      github_id: githubData.id,
      name: githubData.name,
      full_name: githubData.full_name,
      description: githubData.description,
      url: githubData.html_url,
      default_branch: githubData.default_branch,
      language: githubData.language,
      stars: githubData.stargazers_count,
    })

    return NextResponse.json(repository)
  } catch (error) {
    console.error('Error creating repository:', error)
    return NextResponse.json({ error: 'Failed to add repository' }, { status: 500 })
  }
}
