"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { updateLink } from "@/lib/actions/link-actions"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Link } from "@/lib/types"

interface EditLinkDialogProps {
  link: Link | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditLinkDialog({ link, open, onOpenChange, onSuccess }: EditLinkDialogProps) {
  const [formData, setFormData] = useState({
    original_url: "",
    short_code: "",
    active: true,
    expires_at: null as Date | null,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (link) {
      setFormData({
        original_url: link.original_url,
        short_code: link.short_code,
        active: link.active,
        expires_at: link.expires_at ? new Date(link.expires_at) : null,
      })
    }
  }, [link])

  const handleSubmit = async () => {
    if (!link) return

    setIsLoading(true)
    try {
      const result = await updateLink(link.id, {
        original_url: formData.original_url,
        short_code: formData.short_code,
        active: formData.active,
        expires_at: formData.expires_at ? formData.expires_at.toISOString() : null,
      })

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
        description: "Link updated successfully",
      })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
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
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>Update the details of your shortened link</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="original-url">Original URL</Label>
            <Input
              id="original-url"
              value={formData.original_url}
              onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="short-code">Short Code</Label>
            <Input
              id="short-code"
              value={formData.short_code}
              onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expiration">Expiration Date</Label>
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
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
