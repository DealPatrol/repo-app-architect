import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRepository } from '@/lib/queries'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('github_access_token')

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch all repos from GitHub (including private repos via repo scope)
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&type=all', {
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

    // Upsert each repo into the database and collect results with DB ids
    const repositoryList = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const saved = await createRepository({
            github_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            default_branch: repo.default_branch,
            language: repo.language,
            stars: repo.stargazers_count,
          })
          return {
            id: saved.id,
            github_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            language: repo.language,
            stars: repo.stargazers_count,
            default_branch: repo.default_branch,
          }
        } catch (err) {
          console.error('[v0] Error upserting repo:', repo.name, err)
          return null
        }
      })
    )

    const filtered = repositoryList.filter(Boolean)
    console.log('[v0] Fetched and saved', filtered.length, 'repositories')
    return NextResponse.json(filtered)
  } catch (error) {
    console.error('[v0] Error fetching repos:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
