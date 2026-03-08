import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get('github_user_id')

    if (!userIdCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sql = getDb()
    const user = await sql`SELECT * FROM user_auth WHERE github_id = ${parseInt(userIdCookie.value)}`

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const accessToken = user[0].access_token

    // Fetch all repos from GitHub
    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
      },
    })

    if (!reposResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch repos' }, { status: 500 })
    }

    const repos = await reposResponse.json()

    // Return repos with essential info
    const repositoryList = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      default_branch: repo.default_branch,
    }))

    return NextResponse.json(repositoryList)
  } catch (error) {
    console.error('Error fetching repos:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
