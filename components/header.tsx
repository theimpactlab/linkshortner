"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function Header() {
  const { user, signOut } = useAuth()
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on client side
  useEffect(() => {
    setIsClient(true)

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          LinkShortener
        </Link>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {isClient && (isAuthenticated || user) ? (
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
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
