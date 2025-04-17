"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Copy, ExternalLink, MoreHorizontal, Pencil, QrCode, Trash2 } from "lucide-react"
import { deleteLink } from "@/lib/actions/link-actions"
import { EditLinkDialog } from "@/components/admin/edit-link-dialog"
import { QrCodeDialog } from "@/components/admin/qr-code-dialog"
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog"
import type { Link } from "@/lib/types"

interface LinksTableProps {
  links: Link[]
  isLoading: boolean
  onRefresh: () => void
}

export function LinksTable({ links, isLoading, onRefresh }: LinksTableProps) {
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [qrCodeLink, setQrCodeLink] = useState<Link | null>(null)
  const [deletingLink, setDeletingLink] = useState<Link | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const copyToClipboard = (shortCode: string) => {
    const baseUrl = window.location.origin
    navigator.clipboard.writeText(`${baseUrl}/${shortCode}`)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    })
  }

  const handleDelete = async (link: Link) => {
    try {
      await deleteLink(link.id)
      toast({
        title: "Success",
        description: "Link deleted successfully",
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      })
    }
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
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => {
              const shortUrl = `${window.location.origin}/${link.short_code}`
              const truncatedUrl =
                link.original_url.length > 50 ? `${link.original_url.substring(0, 50)}...` : link.original_url

              // Check if link has expiration date
              const hasExpiration = link.expires_at !== null && link.expires_at !== undefined
              const isExpired = hasExpiration && new Date(link.expires_at) < new Date()

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
                    {isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : link.active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(link.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    {hasExpiration ? formatDistanceToNow(new Date(link.expires_at), { addSuffix: true }) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyToClipboard(link.short_code)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setQrCodeLink(link)
                            setIsQrCodeDialogOpen(true)
                          }}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate QR Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingLink(link)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingLink(link)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <EditLinkDialog
        link={editingLink}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={onRefresh}
      />

      {/* QR Code Dialog */}
      <QrCodeDialog link={qrCodeLink} open={isQrCodeDialogOpen} onOpenChange={setIsQrCodeDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          if (deletingLink) {
            handleDelete(deletingLink)
          }
        }}
        title="Delete Link"
        description="Are you sure you want to delete this link? This action cannot be undone."
      />
    </>
  )
}
