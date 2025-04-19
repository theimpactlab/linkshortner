"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      // Check for quick access mode
      const quickAccess = localStorage.getItem("quickAccess") === "true"

      if (quickAccess) {
        setIsAuthorized(true)
        setIsLoading(false)
        return
      }

      // Otherwise check for Supabase session
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        setIsAuthorized(true)
      } else {
        // Only redirect if not in quick access mode
        router.push("/login")
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we check your access</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container py-6 px-4 md:px-6">{children}</div>
      </div>
    </div>
  )
}
