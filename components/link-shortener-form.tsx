"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { createShortLink } from "@/lib/actions/link-actions"
import { Copy, Link } from "lucide-react"

interface LinkShortenerFormProps {
  onSuccess?: () => void
}

export function LinkShortenerForm({ onSuccess }: LinkShortenerFormProps) {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customCode, setCustomCode] = useState("")
  const [shortUrl, setShortUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!originalUrl) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await createShortLink(originalUrl, customCode)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Construct the short URL
      const baseUrl = window.location.origin
      setShortUrl(`${baseUrl}/${result.shortCode}`)

      toast({
        title: "Success!",
        description: "Your link has been shortened",
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Reset form
      setOriginalUrl("")
      setCustomCode("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create short link",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shorten a URL</CardTitle>
        <CardDescription>Enter a long URL to create a shorter, more manageable link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL to shorten</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-code">Custom code (optional)</Label>
            <Input
              id="custom-code"
              placeholder="e.g., my-link"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Leave blank to generate a random code</p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Short Link"}
          </Button>
        </form>
      </CardContent>
      {shortUrl && (
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full p-4 bg-muted rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Link className="h-4 w-4 mr-2" />
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {shortUrl}
              </a>
            </div>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
