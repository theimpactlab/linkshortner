import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If the user is not signed in and the route is protected, redirect to login
  if (!session && req.nextUrl.pathname.startsWith("/admin")) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Prevent redirect loops - if we're already on the login page, don't redirect again
  if (!session && req.nextUrl.pathname === "/login") {
    return res
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
