"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { getUserLinks } from "@/lib/actions/link-actions"
import type { Link } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { Copy, ExternalLink } from "lucide-react"

interface RecentLinksProps {
  limit?: number
  sortBy?: "created_at" | "clicks"
}

export function RecentLinks({ limit = 5, sortBy = "created_at" }: RecentLinksProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const data = await getUserLinks()

        // Sort by the specified field
        const sortedLinks = [...data].sort((a, b) => {
          if (sortBy === "created_at") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          } else {
            return b.clicks - a.clicks
          }
        })

        setLinks(sortedLinks.slice(0, limit))
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
  }, [limit, sortBy])

  const copyToClipboard = (shortCode: string) => {
    const baseUrl = window.location.origin
    navigator.clipboard.writeText(`${baseUrl}/${shortCode}`)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading links...</div>
  }

  if (links.length === 0) {
    return <div className="text-center py-8">No links found. Create your first short link!</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sortBy === "created_at" ? "Recent Links" : "Popular Links"}</CardTitle>
        <CardDescription>
          {sortBy === "created_at" ? "Your most recently created links" : "Your most clicked links"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.map((link) => {
            const shortUrl = `${window.location.origin}/${link.short_code}`
            const truncatedUrl =
              link.original_url.length > 50 ? `${link.original_url.substring(0, 50)}...` : link.original_url

            return (
              <div key={link.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{link.short_code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(link.short_code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span title={link.original_url}>{truncatedUrl}</span>
                    <a href={link.original_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">{link.clicks}</span>
                    <span className="text-muted-foreground">clicks</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
