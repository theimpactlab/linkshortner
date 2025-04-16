"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Link } from "@/lib/types"
import { getUserLinks, deleteLink } from "@/lib/actions/link-actions"
import { LinkTable } from "@/components/link-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkShortenerForm } from "@/components/link-shortener-form"

export default function AdminDashboard() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await getUserLinks()
        setLinks(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch links",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinks()
  }, [])

  const handleDeleteLink = async (id: string) => {
    try {
      await deleteLink(id)
      setLinks(links.filter((link) => link.id !== id))
      toast({
        title: "Success",
        description: "Link deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    }
  }

  const filteredLinks = links.filter(
    (link) => link.short_code.includes(searchTerm) || link.original_url.includes(searchTerm),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="links">
          <TabsList className="mb-8">
            <TabsTrigger value="links">My Links</TabsTrigger>
            <TabsTrigger value="create">Create New Link</TabsTrigger>
          </TabsList>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>My Links</CardTitle>
                <CardDescription>Manage all your shortened links</CardDescription>
                <div className="mt-4">
                  <Input
                    placeholder="Search links..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <LinkTable links={filteredLinks} isLoading={isLoading} onDelete={handleDeleteLink} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <LinkShortenerForm />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
