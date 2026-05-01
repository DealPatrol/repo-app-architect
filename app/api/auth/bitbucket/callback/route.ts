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
    const savedState = cookieStore.get('bitbucket_oauth_state')?.value

    if (error) {
      return NextResponse.redirect(new URL('/?error=bitbucket_oauth_failed', getBaseUrl(request)))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/?error=missing_code', getBaseUrl(request)))
    }

    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL('/?error=invalid_oauth_state', getBaseUrl(request)))
    }

    const clientId = process.env.BITBUCKET_CLIENT_ID
    const clientSecret = process.env.BITBUCKET_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?error=bitbucket_oauth_not_configured', getBaseUrl(request)))
    }

    const redirectUri = `${getBaseUrl(request)}/api/auth/bitbucket/callback`

    // Bitbucket uses HTTP Basic Auth for token exchange
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenResponse = await fetch('https://bitbucket.org/site/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
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
      new URL('/dashboard/repositories?connected=bitbucket', getBaseUrl(request))
    )

    response.cookies.set('bitbucket_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    response.cookies.set('bitbucket_oauth_state', '', { path: '/', maxAge: 0 })

    return response
  } catch {
    return NextResponse.redirect(new URL('/?error=oauth_callback_failed', getBaseUrl(request)))
  }
}
