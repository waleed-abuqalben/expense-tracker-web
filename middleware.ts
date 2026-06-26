import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_FILE = /\.(.*)$/

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow Next internals, API routes, static files and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Read token cookie (set by client on successful login)
  const token = req.cookies.get("token")?.value

  // If user is already authenticated and tries to visit /login or /signup, send them to budget chooser
  if ((pathname === "/login" || pathname === "/signup") && token) {
    const url = req.nextUrl.clone()
    url.pathname = "/budgets"
    return NextResponse.redirect(url)
  }

  // Paths we want to protect (root and budgets pages). Extend this list as needed.
  const protectedPaths = ["/", "/budgets", "/recurring-transactions"]

  const shouldProtect = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (shouldProtect && !token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    // preserve where user wanted to go
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/signup", "/budgets/:path*", "/recurring-transactions/:path*"],
}
