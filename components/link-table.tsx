"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Link } from "@/lib/types"
import { Copy, ExternalLink, Trash2, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formatDistanceToNow } from "date-fns"
import { updateLink, deleteLink } from "@/lib/actions/link-actions"

interface LinkTableProps {
  links: Link[]
  isLoading: boolean
  onDelete: (id: string) => Promise<void>
}

export function LinkTable({ links, isLoading, onDelete }: LinkTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    original_url: "",
    short_code: "",
    active: true,
  })

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteLink(deleteId)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        await onDelete(deleteId)
        toast({
          title: "Success",
          description: "Link deleted successfully",
        })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleEdit = (link: Link) => {
    setEditingLink(link)
    setEditFormData({
      original_url: link.original_url,
      short_code: link.short_code,
      active: link.active,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingLink) return

    setIsEditing(true)
    try {
      const result = await updateLink(editingLink.id, editFormData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        // Update the link in the local state
        const updatedLinks = links.map((link) => (link.id === editingLink.id ? { ...link, ...editFormData } : link))

        toast({
          title: "Success",
          description: "Link updated successfully",
        })

        // Close the dialog and refresh the page to show updated data
        setIsEditDialogOpen(false)
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Short Link</TableHead>
              <TableHead>Original URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const shortUrl = `${window.location.origin}/${link.short_code}`
              const truncatedUrl =
                link.original_url.length > 50 ? `${link.original_url.substring(0, 50)}...` : link.original_url

              return (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {link.short_code}
                      </a>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(link.short_code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span title={link.original_url}>{truncatedUrl}</span>
                      <a href={link.original_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{link.clicks}</TableCell>
                  <TableCell>
                    <span className={link.active ? "text-green-500" : "text-red-500"}>
                      {link.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(link)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteId(link.id)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Update your link details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="original-url">Original URL</Label>
              <Input
                id="original-url"
                value={editFormData.original_url}
                onChange={(e) => setEditFormData({ ...editFormData, original_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-code">Short Code</Label>
              <Input
                id="short-code"
                value={editFormData.short_code}
                onChange={(e) => setEditFormData({ ...editFormData, short_code: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editFormData.active}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditing}>
              {isEditing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
