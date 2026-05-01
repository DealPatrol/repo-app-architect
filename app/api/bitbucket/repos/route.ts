import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface BitbucketRepo {
  slug: string
  name: string
  full_name: string
  description: string
  links: { html: { href: string } }
  mainbranch: { name: string } | null
  is_private: boolean
  language: string
  size: number
  updated_on: string
}

interface BitbucketResponse {
  values: BitbucketRepo[]
  next?: string
}

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('bitbucket_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated with Bitbucket' }, { status: 401 })
  }

  try {
    const repos: BitbucketRepo[] = []
    let url: string | undefined = 'https://api.bitbucket.org/2.0/repositories?role=member&pagelen=100&sort=-updated_on'

    while (url && repos.length < 300) {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'CodeVault',
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        if (res.status === 401) {
          return NextResponse.json({ error: 'Bitbucket token expired — please reconnect' }, { status: 401 })
        }
        break
      }

      const data = (await res.json()) as BitbucketResponse
      repos.push(...data.values)
      url = data.next
    }

    const normalized = repos.map((r) => ({
      id: r.full_name,
      name: r.name,
      full_name: r.full_name,
      description: r.description || null,
      url: r.links.html.href,
      language: r.language || null,
      stars: 0,
      default_branch: r.mainbranch?.name ?? 'main',
      private: r.is_private,
      platform: 'bitbucket',
    }))

    return NextResponse.json(normalized)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Bitbucket repositories' }, { status: 500 })
  }
}
