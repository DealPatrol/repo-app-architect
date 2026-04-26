import { NextResponse } from 'next/server'
import { GITHUB_ACCESS_TOKEN_COOKIE } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('github_user_id', '', { path: '/', maxAge: 0 })
  response.cookies.set(GITHUB_ACCESS_TOKEN_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set('github_oauth_state', '', { path: '/', maxAge: 0 })
  return response
}
