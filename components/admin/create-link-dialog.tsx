"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { createShortLink } from "@/lib/actions/link-actions"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CreateLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateLinkDialog({ open, onOpenChange, onSuccess }: CreateLinkDialogProps) {
  const [formData, setFormData] = useState({
    original_url: "",
    short_code: "",
    expires_at: null as Date | null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!formData.original_url) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await createShortLink(
        formData.original_url,
        formData.short_code || undefined,
        formData.expires_at ? formData.expires_at.toISOString() : undefined,
      )

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Link created successfully",
      })

      // Reset form
      setFormData({
        original_url: "",
        short_code: "",
        expires_at: null,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create link",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Link</DialogTitle>
          <DialogDescription>Create a new shortened link for your URL</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="original-url">Original URL</Label>
            <Input
              id="original-url"
              placeholder="https://example.com/very/long/url"
              value={formData.original_url}
              onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="short-code">Custom Short Code (optional)</Label>
            <Input
              id="short-code"
              placeholder="e.g., my-link"
              value={formData.short_code}
              onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">Leave blank to generate a random code</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiration">Expiration Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expires_at && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expires_at ? format(formData.expires_at, "PPP") : "No expiration"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expires_at || undefined}
                  onSelect={(date) => setFormData({ ...formData, expires_at: date })}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setFormData({ ...formData, expires_at: null })}
                  >
                    Clear Expiration
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
