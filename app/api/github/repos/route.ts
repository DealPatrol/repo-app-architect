import { NextResponse } from 'next/server'
import { getCurrentAccessToken } from '@/lib/auth'
import { listGitHubRepositories } from '@/lib/github'

export async function GET() {
  try {
    const accessToken = await getCurrentAccessToken()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated. Please install the CodeVault GitHub App.' },
        { status: 401 }
      )
    }

    const repositories = await listGitHubRepositories(accessToken)
    return NextResponse.json(repositories)
  } catch (error) {
    console.error('[v0] Error fetching repos:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
