import { NextRequest, NextResponse } from 'next/server'

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

function getGitHubClientId() {
  return process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
}

export async function GET(request: NextRequest) {
  const clientId = getGitHubClientId()

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID in your environment.' },
      { status: 500 }
    )
  }

  const state = crypto.randomUUID()
  const redirectUri = `${getBaseUrl(request)}/api/auth/github/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user repo',
    state,
  })
  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  const response = NextResponse.redirect(githubAuthUrl)
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
