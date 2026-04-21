import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID in your environment.' },
      { status: 500 }
    )
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
  const scope = 'read:user repo'
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

  return NextResponse.redirect(githubAuthUrl)
}
