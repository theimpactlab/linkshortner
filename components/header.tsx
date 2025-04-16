"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          LinkShortener
        </Link>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()}>
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
