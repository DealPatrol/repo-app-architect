import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
}

function getGitHubClientId() {
  return process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const cookieStore = await cookies()
    const savedState = cookieStore.get('github_oauth_state')?.value

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/repositories?error=missing_code', getBaseUrl(request)))
    }

    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(new URL('/dashboard/repositories?error=invalid_oauth_state', getBaseUrl(request)))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: getGitHubClientId(),
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${getBaseUrl(request)}/api/auth/github/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL('/dashboard/repositories?error=token_exchange_failed', getBaseUrl(request)))
    }

    const { access_token } = await tokenResponse.json()

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github+json',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/dashboard/repositories?error=github_user_fetch_failed', getBaseUrl(request)))
    }

    const githubUser = await userResponse.json()

    // Save/update user in database
    const sql = getDb()
    await sql`
      INSERT INTO user_auth (github_id, github_username, github_avatar_url, access_token)
      VALUES (${githubUser.id}, ${githubUser.login}, ${githubUser.avatar_url}, ${access_token})
      ON CONFLICT (github_id) 
      DO UPDATE SET 
        access_token = ${access_token},
        updated_at = CURRENT_TIMESTAMP
    `

    // Set session cookie
    const response = NextResponse.redirect(new URL('/dashboard/repositories?connected=github', getBaseUrl(request)))
    response.cookies.set('github_user_id', String(githubUser.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    response.cookies.set('github_oauth_state', '', { path: '/', maxAge: 0 })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/repositories?error=oauth_callback_failed', getBaseUrl(request)))
  }
}
