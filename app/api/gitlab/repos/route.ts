import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
  description: string | null
  web_url: string
  default_branch: string | null
  visibility: string
  star_count: number
  forks_count: number
  last_activity_at: string
  topics: string[]
  programming_language?: string
}

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('gitlab_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with GitLab' }, { status: 401 })
  }

  try {
    const repos: GitLabProject[] = []
    let page = 1
    const perPage = 100

    while (repos.length < 300) {
      const res = await fetch(
        `https://gitlab.com/api/v4/projects?membership=true&per_page=${perPage}&page=${page}&order_by=last_activity_at&sort=desc`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'CodeVault',
          },
          cache: 'no-store',
        }
      )

      if (!res.ok) {
        if (res.status === 401) {
          return NextResponse.json({ error: 'GitLab token expired — please reconnect' }, { status: 401 })
        }
        break
      }

      const data = (await res.json()) as GitLabProject[]
      if (data.length === 0) break
      repos.push(...data)

      const totalPages = Number(res.headers.get('X-Total-Pages') ?? 1)
      if (page >= totalPages) break
      page++
    }

    const normalized = repos.map((p) => ({
      id: p.id,
      name: p.name,
      full_name: p.path_with_namespace,
      description: p.description,
      url: p.web_url,
      language: null,
      stars: p.star_count,
      default_branch: p.default_branch ?? 'main',
      private: p.visibility === 'private',
      platform: 'gitlab',
    }))

    return NextResponse.json(normalized)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch GitLab repositories' }, { status: 500 })
  }
}
