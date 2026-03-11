import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
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
      console.error('[v0] Token response error:', tokenResponse.status)
      return NextResponse.redirect(new URL('/?error=token_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const access_token = tokenData.access_token

    if (!access_token) {
      console.error('[v0] No access token in response:', tokenData)
      return NextResponse.redirect(new URL('/?error=no_token', request.url))
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github+json',
      },
    })

    if (!userResponse.ok) {
      console.error('[v0] User response error:', userResponse.status)
      return NextResponse.redirect(new URL('/?error=user_failed', request.url))
    }

    const githubUser = await userResponse.json()

    // Set session cookie with user data
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    // Store user info and token in cookies
    response.cookies.set('github_access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    response.cookies.set('github_user_id', String(githubUser.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    response.cookies.set('github_username', githubUser.login, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[v0] OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=server_error', request.url))
  }
}
