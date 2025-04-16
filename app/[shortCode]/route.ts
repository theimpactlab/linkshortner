import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { shortCode: string } }) {
  const shortCode = params.shortCode
  const supabase = createServerSupabaseClient()

  try {
    // Find the link
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("short_code", shortCode)
      .eq("active", true)
      .single()

    if (error || !link) {
      return NextResponse.redirect(new URL("/not-found", request.url))
    }

    // Increment click count
    await supabase
      .from("links")
      .update({ clicks: link.clicks + 1 })
      .eq("id", link.id)

    // Log click details
    const referrer = request.headers.get("referer") || ""
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.ip || ""

    await supabase.from("clicks").insert({
      link_id: link.id,
      referrer,
      user_agent: userAgent,
      ip_address: ip,
    })

    // Redirect to the original URL
    return NextResponse.redirect(link.original_url)
  } catch (error) {
    console.error("Error in redirect handler:", error)
    return NextResponse.redirect(new URL("/not-found", request.url))
  }
}
