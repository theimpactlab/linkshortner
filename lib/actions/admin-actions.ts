"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Get user statistics
export async function getUserStats() {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Get total links count
    const { count: totalLinks } = await supabase
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)

    // Get total clicks
    const { data: clicksData } = await supabase.from("links").select("clicks").eq("user_id", session.user.id)

    const totalClicks = clicksData?.reduce((sum, link) => sum + link.clicks, 0) || 0

    // Get active links count
    const { count: activeLinks } = await supabase
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("active", true)

    // Get links expiring in the next 7 days
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { count: expiringLinks } = await supabase
      .from("links")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .lt("expires_at", sevenDaysFromNow.toISOString())
      .gt("expires_at", new Date().toISOString())

    return {
      totalLinks: totalLinks || 0,
      totalClicks,
      activeLinks: activeLinks || 0,
      expiringLinks: expiringLinks || 0,
    }
  } catch (error) {
    console.error("Error in getUserStats:", error)
    throw new Error("Failed to fetch user statistics")
  }
}

// Get all users (admin only)
export async function getUsers() {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Get all users
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      throw new Error(error.message)
    }

    // Get additional user data from users table
    const { data: usersData } = await supabase.from("users").select("*")

    // Combine auth users with users table data
    const combinedUsers = users.users.map((user) => {
      const additionalData = usersData?.find((u) => u.id === user.id) || {}
      return {
        ...user,
        ...additionalData,
      }
    })

    return combinedUsers
  } catch (error) {
    console.error("Error in getUsers:", error)
    throw new Error("Failed to fetch users")
  }
}

// Create a new user (admin only)
export async function createUser({ email, password, role = "user" }) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return { error: error.message }
    }

    // Add user to users table with role
    if (data.user) {
      await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        role,
      })
    }

    revalidatePath("/admin/users")
    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Error in createUser:", error)
    return { error: error.message || "Failed to create user" }
  }
}

// Update a user (admin only)
export async function updateUser(userId: string, updates: { email?: string; role?: string }) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Update user email if provided
    if (updates.email) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email: updates.email,
      })

      if (error) {
        return { error: error.message }
      }
    }

    // Update user role if provided
    if (updates.role) {
      const { error } = await supabase.from("users").update({ role: updates.role }).eq("id", userId)

      if (error) {
        return { error: error.message }
      }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateUser:", error)
    return { error: error.message || "Failed to update user" }
  }
}

// Reset a user's password (admin only)
export async function resetUserPassword(userId: string, password: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Reset password
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in resetUserPassword:", error)
    return { error: error.message || "Failed to reset password" }
  }
}

// Delete a user (admin only)
export async function deleteUser(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Delete user
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error in deleteUser:", error)
    return { error: error.message || "Failed to delete user" }
  }
}

// Update current user's password
export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { error: "Unauthorized" }
    }

    // First verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return { error: "Current password is incorrect" }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in updatePassword:", error)
    return { error: error.message || "Failed to update password" }
  }
}
