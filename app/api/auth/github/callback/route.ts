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
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!clientId || !clientSecret || !appUrl) {
      console.error('[v0] Missing OAuth environment variables')
      return NextResponse.redirect(new URL('/?error=config_error', request.url))
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${appUrl}/api/auth/github/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('[v0] Token response error:', tokenResponse.status, tokenResponse.statusText)
      const errorData = await tokenResponse.text()
      console.error('[v0] Token error details:', errorData)
      return NextResponse.json({ error: 'Failed to get token from GitHub' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const access_token = tokenData.access_token

    if (!access_token) {
      console.error('[v0] No access token in response:', tokenData)
      return NextResponse.json({ error: 'No access token received from GitHub' }, { status: 400 })
    }

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github+json',
      },
    })

    if (!userResponse.ok) {
      console.error('[v0] User response error:', userResponse.status, userResponse.statusText)
      return NextResponse.json({ error: 'Failed to get user info from GitHub' }, { status: 400 })
    }

    const githubUser = await userResponse.json()
    
    console.log('[v0] GitHub user authenticated:', githubUser.login)

    // Set session cookie with user data
    const dashboardUrl = new URL('/dashboard', appUrl)
    const response = NextResponse.redirect(dashboardUrl)
    
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
