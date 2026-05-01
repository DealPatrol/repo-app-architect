import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const cookieStore = await cookies()
    const savedState = cookieStore.get('gitlab_oauth_state')?.value

    if (error) {
      return NextResponse.redirect(new URL(`/?error=gitlab_oauth_failed`, getBaseUrl(request)))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=missing_code', getBaseUrl(request)))
    }

    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL('/?error=invalid_oauth_state', getBaseUrl(request)))
    }

    const clientId = process.env.GITLAB_CLIENT_ID
    const clientSecret = process.env.GITLAB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=gitlab_oauth_not_configured', getBaseUrl(request)))
    }

    const redirectUri = `${getBaseUrl(request)}/api/auth/gitlab/callback`

    const tokenResponse = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', getBaseUrl(request)))
    }

    const tokenJson = (await tokenResponse.json()) as { access_token?: string; error?: string }
    const access_token = tokenJson.access_token

    if (!access_token) {
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', getBaseUrl(request)))
    }

    const response = NextResponse.redirect(
      new URL('/dashboard/repositories?connected=gitlab', getBaseUrl(request))
    )

    response.cookies.set('gitlab_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    response.cookies.set('gitlab_oauth_state', '', { path: '/', maxAge: 0 })

    return response
  } catch {
    return NextResponse.redirect(new URL('/?error=oauth_callback_failed', getBaseUrl(request)))
  }
}
