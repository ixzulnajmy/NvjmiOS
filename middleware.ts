import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for NvjmiOS
 *
 * Since this is a single-user app with device-level PIN security,
 * we don't use Supabase auth middleware anymore.
 * The PIN lock state is managed client-side via sessionStorage.
 *
 * This middleware only handles basic routing:
 * - Public routes: /unlock
 * - Protected routes: Everything else
 *
 * Note: Actual PIN verification happens client-side.
 * Server components just need to trust the session.
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow unlock page and static assets
  if (
    pathname === '/unlock' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For all other routes, allow access (PIN check happens client-side)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
