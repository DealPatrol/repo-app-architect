import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    const userId = request.cookies.get('github_user_id')?.value
    const accessToken = request.cookies.get('github_access_token')?.value
    if (!userId || !accessToken) {
      return NextResponse.redirect(new URL('/?error=auth_required', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
