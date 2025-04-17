"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentLinks } from "@/components/admin/recent-links"
import { StatsCards } from "@/components/admin/stats-cards"

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          console.log("No session found in admin page, redirecting to login")
          router.push("/login")
          return
        }

        console.log("Session found in admin page, user is authenticated")
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking auth in admin page:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your link shortener activity</p>
      </div>

      <StatsCards />

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Links</TabsTrigger>
          <TabsTrigger value="popular">Popular Links</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <RecentLinks />
        </TabsContent>
        <TabsContent value="popular" className="space-y-4">
          <RecentLinks sortBy="clicks" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
