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

// Derive a stable negative integer ID for non-GitHub repos so the `github_id`
// UNIQUE column doesn't conflict with real GitHub IDs (which are always positive).
function stableNegativeId(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = Math.imul(31, hash) + char | 0
  }
  return hash <= 0 ? hash : -hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body as { url?: string }

    if (!url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
    }

    // ── GitHub ───────────────────────────────────────────────────────────────
    const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/i)
    if (githubMatch) {
      const [, owner, repo] = githubMatch
      const repoName = repo.replace(/\.git$/, '')

      const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'RepoFuse',
        },
      })

      if (!githubRes.ok) {
        if (githubRes.status === 404) {
          return NextResponse.json({ error: 'GitHub repository not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to fetch repository from GitHub' }, { status: 500 })
      }

      const data = await githubRes.json()
      const repository = await createRepository({
        github_id: data.id,
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        url: data.html_url,
        default_branch: data.default_branch,
        language: data.language,
        stars: data.stargazers_count,
      })
      return NextResponse.json(repository)
    }

    // ── GitLab ───────────────────────────────────────────────────────────────
    const gitlabMatch = url.match(/gitlab\.com\/([^?#]+)/i)
    if (gitlabMatch) {
      const fullPath = gitlabMatch[1].replace(/\.git$/, '').replace(/\/$/, '')
      const encoded = encodeURIComponent(fullPath)

      const glRes = await fetch(`https://gitlab.com/api/v4/projects/${encoded}`, {
        headers: { 'User-Agent': 'RepoFuse' },
      })

      if (!glRes.ok) {
        if (glRes.status === 404) {
          return NextResponse.json({ error: 'GitLab project not found (private projects require GitLab sign-in)' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to fetch project from GitLab' }, { status: 500 })
      }

      const data = await glRes.json()
      const repository = await createRepository({
        github_id: -Math.abs(data.id),  // negative to avoid colliding with GitHub IDs
        name: data.name,
        full_name: data.path_with_namespace,
        description: data.description ?? null,
        url: data.web_url,
        default_branch: data.default_branch ?? 'main',
        language: null,
        stars: data.star_count ?? 0,
      })
      return NextResponse.json(repository)
    }

    // ── Bitbucket ────────────────────────────────────────────────────────────
    const bbMatch = url.match(/bitbucket\.org\/([^/]+)\/([^/?#]+)/i)
    if (bbMatch) {
      const [, workspace, slug] = bbMatch
      const repoSlug = slug.replace(/\.git$/, '')

      const bbRes = await fetch(
        `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`,
        { headers: { 'User-Agent': 'RepoFuse' } }
      )

      if (!bbRes.ok) {
        if (bbRes.status === 404) {
          return NextResponse.json({ error: 'Bitbucket repository not found (private repos require Bitbucket sign-in)' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Failed to fetch repository from Bitbucket' }, { status: 500 })
      }

      const data = await bbRes.json()
      const full_name: string = data.full_name ?? `${workspace}/${repoSlug}`
      const repository = await createRepository({
        github_id: stableNegativeId(`bitbucket:${full_name}`),
        name: data.name ?? repoSlug,
        full_name,
        description: data.description ?? null,
        url: data.links?.html?.href ?? url,
        default_branch: data.mainbranch?.name ?? 'main',
        language: data.language ?? null,
        stars: 0,
      })
      return NextResponse.json(repository)
    }

    return NextResponse.json(
      { error: 'Unsupported URL. Paste a GitHub (github.com), GitLab (gitlab.com), or Bitbucket (bitbucket.org) repository URL.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error adding repository:', error)
    return NextResponse.json({ error: 'Failed to add repository' }, { status: 500 })
  }
}
