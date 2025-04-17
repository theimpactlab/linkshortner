"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getUserLinks } from "@/lib/actions/link-actions"
import { LinksTable } from "@/components/admin/links-table"
import { PlusCircle } from "lucide-react"
import { CreateLinkDialog } from "@/components/admin/create-link-dialog"

export default function LinksPage() {
  const [links, setLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
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

  useEffect(() => {
    fetchLinks()
  }, [])

  const filteredLinks = links.filter(
    (link) => link.short_code.includes(searchTerm) || link.original_url.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Links</h1>
          <p className="text-muted-foreground">Manage your shortened links</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Links</CardTitle>
              <CardDescription>View and manage all your shortened links</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px]"
              />
              <Button variant="outline" onClick={fetchLinks}>
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LinksTable links={filteredLinks} isLoading={isLoading} onRefresh={fetchLinks} />
        </CardContent>
      </Card>

      <CreateLinkDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={fetchLinks} />
    </div>
  )
}
