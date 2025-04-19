"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { supabase } from "@/lib/supabase/client"

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isQuickAccess, setIsQuickAccess] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check for quick access mode
    const quickAccess = localStorage.getItem("quickAccess") === "true"
    setIsQuickAccess(quickAccess)

    // Check for Supabase session
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    // Clear quick access if enabled
    if (isQuickAccess) {
      localStorage.removeItem("quickAccess")
    }

    // Sign out from Supabase if authenticated
    if (isAuthenticated) {
      await supabase.auth.signOut()
    }

    // Redirect to home
    window.location.href = "/"
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          LinkShortener
        </Link>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {isClient && (isAuthenticated || isQuickAccess) ? (
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                {isQuickAccess ? "Exit Admin" : "Sign Out"}
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
