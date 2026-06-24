import { NextResponse, type NextRequest } from 'next/server'

/**
 * Redirects unauthenticated local users away from protected pages before UI renders.
 * @param request - The incoming Next.js request inspected for the auth cookie.
 * @returns The next response for signed-in users, or a signin redirect with return path.
 * @example
 * proxy(request) // => NextResponse.redirect('/signin?next=/orders')
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has('token')) {
    return NextResponse.next()
  }

  const signinUrl = new URL('/signin', request.url)
  signinUrl.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )

  return NextResponse.redirect(signinUrl)
}

export const config = {
  matcher: [
    '/sell/:path*',
    '/orders/:path*',
    '/order/:path*',
    '/update/:path*',
    '/permissions/:path*',
  ],
}
