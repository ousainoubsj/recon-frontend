import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Optimistic check only — reads the session cookie's presence, does not
// validate it's still live server-side (Proxy can't cheaply call the
// separate Express backend on every request). The authoritative check lives
// in app/dashboard/layout.tsx via authClient.useSession().
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/dashboard") && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (pathname === "/" && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
}
