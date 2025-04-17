"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, LinkIcon, Settings, Users, LogOut, Home } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

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
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
