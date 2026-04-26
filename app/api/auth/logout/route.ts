import { NextRequest, NextResponse } from 'next/server'
import { GITHUB_ACCESS_TOKEN_COOKIE } from '@/lib/auth'

function clearSessionCookies(response: NextResponse) {
  response.cookies.set('github_user_id', '', { path: '/', maxAge: 0 })
  response.cookies.set(GITHUB_ACCESS_TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set('github_oauth_state', '', { path: '/', maxAge: 0 })
  return response
}

export async function POST() {
  return clearSessionCookies(NextResponse.json({ success: true }))
}

export async function DELETE() {
  return clearSessionCookies(NextResponse.json({ success: true }))
}

export async function GET(request: NextRequest) {
  return clearSessionCookies(NextResponse.redirect(new URL('/', request.url)))
}
