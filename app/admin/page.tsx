"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentLinks } from "@/components/admin/recent-links"
import { StatsCards } from "@/components/admin/stats-cards"

export default function AdminDashboard() {
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
