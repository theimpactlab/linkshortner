import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Create the Supabase client
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the current URL path
    const path = req.nextUrl.pathname

    // Debug logging
    console.log("Middleware path:", path, "Session exists:", !!session)

    // If accessing admin routes without authentication, redirect to login
    if (!session && path.startsWith("/admin")) {
      console.log("Redirecting to login from:", path)
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirectTo", path)
      return NextResponse.redirect(redirectUrl)
    }

    // If already authenticated and trying to access login page, redirect to admin
    if (session && path === "/login") {
      console.log("Already authenticated, redirecting to admin")
      // Check if there's a redirectTo parameter
      const redirectTo = req.nextUrl.searchParams.get("redirectTo") || "/admin"
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    // For all other cases, continue with the request
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, allow the request to continue
    return res
  }
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
