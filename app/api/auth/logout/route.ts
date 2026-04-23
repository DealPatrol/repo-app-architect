import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('github_user_id', '', { path: '/', maxAge: 0 })
  response.cookies.set('github_oauth_state', '', { path: '/', maxAge: 0 })
  return response
}
