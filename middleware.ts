import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard']

// Routes that are always public
const PUBLIC_PATHS = ['/', '/login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths through without auth check
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if the path requires authentication
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (requiresAuth) {
    const userIdCookie = request.cookies.get('github_user_id')

    if (!userIdCookie?.value) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('github_user_id')
    if (!token) {
      return NextResponse.redirect(new URL('/?error=auth_required', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
