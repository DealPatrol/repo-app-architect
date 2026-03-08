import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/auth/error?message=No+code+provided', request.url))
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(new URL('/auth/error?message=Failed+to+get+token', request.url))
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
      return NextResponse.redirect(new URL('/auth/error?message=Failed+to+get+user', request.url))
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
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('github_user_id', String(githubUser.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/error?message=Server+error', request.url))
  }
}
