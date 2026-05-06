import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GITLAB_CLIENT_ID
  const from = request.nextUrl.searchParams.get('from')
  const errorBase = from === 'dashboard' ? '/dashboard/repositories' : '/'

  if (!clientId) {
    return NextResponse.redirect(new URL(`${errorBase}?error=gitlab_oauth_not_configured`, getBaseUrl(request)))
  }

  const state = crypto.randomUUID()
  const redirectUri = `${getBaseUrl(request)}/api/auth/gitlab/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'read_user read_repository',
    state,
  })

  const response = NextResponse.redirect(`https://gitlab.com/oauth/authorize?${params.toString()}`)
  response.cookies.set('gitlab_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })
  // Persist the return destination across the OAuth round-trip
  response.cookies.set('gitlab_oauth_from', from ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })

  return response
}
