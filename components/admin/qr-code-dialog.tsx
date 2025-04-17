"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
import QRCode from "qrcode"
import type { Link } from "@/lib/types"

interface QrCodeDialogProps {
  link: Link | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QrCodeDialog({ link, open, onOpenChange }: QrCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (link && open) {
      const shortUrl = `${window.location.origin}/${link.short_code}`
      generateQRCode(shortUrl)
    } else {
      setQrCodeUrl(null)
    }
  }, [link, open])

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrCodeUrl(dataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qrcode-${link?.short_code || "link"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to access your shortened link</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          {qrCodeUrl ? (
            <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-muted flex items-center justify-center">Generating QR code...</div>
          )}
        </div>
        {link && (
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-medium">{`${window.location.origin}/${link.short_code}`}</p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={downloadQRCode} disabled={!qrCodeUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
