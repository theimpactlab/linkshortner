"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, LinkIcon, Settings, Users, LogOut, Home, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { supabase } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function Sidebar() {
  const pathname = usePathname()
  const [isQuickAccess, setIsQuickAccess] = useState(false)

  useEffect(() => {
    // Check for quick access mode
    const quickAccess = localStorage.getItem("quickAccess") === "true"
    setIsQuickAccess(quickAccess)
  }, [])

  const handleSignOut = async () => {
    // Clear quick access if enabled
    if (isQuickAccess) {
      localStorage.removeItem("quickAccess")
    } else {
      // Sign out from Supabase
      await supabase.auth.signOut()
    }

    // Redirect to home
    window.location.href = "/"
  }

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Links",
      icon: LinkIcon,
      href: "/admin/links",
      active: pathname === "/admin/links",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex flex-col h-full border-r bg-background w-64">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <LinkIcon className="h-6 w-6" />
          <span>LinkShortener</span>
        </Link>
      </div>

      {isQuickAccess && (
        <Alert className="mx-2 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Quick access mode enabled</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1 px-2 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </div>
          </Link>
          <ModeToggle />
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {isQuickAccess ? "Exit Admin Mode" : "Sign Out"}
        </Button>
      </div>
    </div>
  )
}
