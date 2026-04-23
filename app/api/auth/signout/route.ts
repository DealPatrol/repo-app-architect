import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')
  )
  response.cookies.delete('github_access_token')
  response.cookies.delete('github_user_id')
  response.cookies.delete('github_username')
  return response
}
