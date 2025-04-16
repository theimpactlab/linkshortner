"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"
import type { Link } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function createShortLink(originalUrl: string, customCode?: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Validate URL
    try {
      new URL(originalUrl)
    } catch (error) {
      return { error: "Invalid URL format" }
    }

    // Generate short code if not provided
    const shortCode = customCode || nanoid(6)

    // Check if custom code already exists
    if (customCode) {
      const { data: existingLink } = await supabase.from("links").select("id").eq("short_code", shortCode).single()

      if (existingLink) {
        return { error: "This custom code is already in use" }
      }
    }

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // Insert new link
    const { data, error } = await supabase
      .from("links")
      .insert({
        original_url: originalUrl,
        short_code: shortCode,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating short link:", error)
      return { error: "Failed to create short link" }
    }

    revalidatePath("/admin")
    return { shortCode }
  } catch (error) {
    console.error("Error in createShortLink:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getUserLinks() {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return []
    }

    // Get links for current user
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user links:", error)
      throw new Error("Failed to fetch links")
    }

    return data as Link[]
  } catch (error) {
    console.error("Error in getUserLinks:", error)
    throw new Error("An unexpected error occurred")
  }
}

export async function deleteLink(id: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Delete link
    const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", session.user.id)

    if (error) {
      console.error("Error deleting link:", error)
      throw new Error("Failed to delete link")
    }

    revalidatePath("/admin")
  } catch (error) {
    console.error("Error in deleteLink:", error)
    throw new Error("An unexpected error occurred")
  }
}
