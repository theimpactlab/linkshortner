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

    // If accessing admin routes without authentication, redirect to login
    // But only for specific admin routes that really need protection
    if (!session && path.startsWith("/admin/users")) {
      const redirectUrl = new URL("/login", req.url)
      return NextResponse.redirect(redirectUrl)
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
  matcher: ["/admin/users/:path*"],
}
