import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('github_access_token')

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch all repos from GitHub
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`,
        'Accept': 'application/vnd.github+json',
      },
    })

    if (!reposResponse.ok) {
      console.error('[v0] GitHub API error:', reposResponse.status, reposResponse.statusText)
      return NextResponse.json({ error: 'Failed to fetch repos from GitHub' }, { status: 500 })
    }

    const repos = await reposResponse.json()

    // Return repos with essential info
    const repositoryList = repos.map((repo: any) => ({
      github_id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      default_branch: repo.default_branch,
    }))

    console.log('[v0] Fetched', repositoryList.length, 'repositories')
    return NextResponse.json(repositoryList)
  } catch (error) {
    console.error('[v0] Error fetching repos:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
