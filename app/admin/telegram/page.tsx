"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { InfoIcon, Copy, Check } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function TelegramLinkPage() {
  const { user } = useAuth()
  const [linkCode, setLinkCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [telegramChatId, setTelegramChatId] = useState<string | null>(null)

  // Check if user already has a linked Telegram account
  useEffect(() => {
    const checkTelegramLink = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("telegram_users")
          .select("telegram_chat_id")
          .eq("user_id", user.id)
          .single()

        if (data && !error) {
          setTelegramChatId(data.telegram_chat_id)
        }
      } catch (error) {
        console.error("Error checking Telegram link:", error)
      }
    }

    checkTelegramLink()
  }, [user])

  const generateLinkCode = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to link your Telegram account",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Generate a random code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()

      // Store the code in the database temporarily
      const { error } = await supabase.from("telegram_link_codes").insert({
        code,
        user_id: user.id,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
      })

      if (error) {
        throw error
      }

      setLinkCode(code)
    } catch (error) {
      console.error("Error generating link code:", error)
      toast({
        title: "Error",
        description: "Failed to generate link code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`/link ${linkCode}`)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const unlinkTelegram = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("telegram_users").delete().eq("user_id", user.id)

      if (error) {
        throw error
      }

      setTelegramChatId(null)
      toast({
        title: "Success",
        description: "Your Telegram account has been unlinked",
      })
    } catch (error) {
      console.error("Error unlinking Telegram:", error)
      toast({
        title: "Error",
        description: "Failed to unlink Telegram account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telegram Integration</h1>
        <p className="text-muted-foreground">Link your Telegram account to manage links via chat</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Link Your Telegram Account</CardTitle>
          <CardDescription>Connect your Telegram account to manage your links via chat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {telegramChatId ? (
            <>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Telegram Account Linked</AlertTitle>
                <AlertDescription>
                  Your Telegram account is already linked. You can use the bot to manage your links.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button variant="outline" onClick={unlinkTelegram}>
                  Unlink Telegram Account
                </Button>
              </div>
            </>
          ) : (
            <>
              <ol className="list-decimal list-inside space-y-4">
                <li>
                  Start a chat with our bot on Telegram:{" "}
                  <a
                    href="https://t.me/YourBotUsername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @YourBotUsername
                  </a>
                </li>
                <li>Generate a link code by clicking the button below</li>
                <li>Send the command with your link code to the bot</li>
              </ol>

              {linkCode ? (
                <div className="mt-6 space-y-4">
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Your Link Code</AlertTitle>
                    <AlertDescription>
                      Send this command to the bot: <code className="bg-muted p-1 rounded">/link {linkCode}</code>
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={copyToClipboard}>
                      {isCopied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Command
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button onClick={generateLinkCode} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Link Code"}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Commands</CardTitle>
          <CardDescription>Here are the commands you can use with the Telegram bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Create Links</h3>
                <p className="text-sm text-muted-foreground mb-2">Send any URL to create a short link</p>
                <code className="text-xs bg-muted p-1 rounded block">https://example.com</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Custom Links</h3>
                <p className="text-sm text-muted-foreground mb-2">Create a link with custom code</p>
                <code className="text-xs bg-muted p-1 rounded block">/custom https://example.com my-link</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">List Links</h3>
                <p className="text-sm text-muted-foreground mb-2">List your recent links</p>
                <code className="text-xs bg-muted p-1 rounded block">/list</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Edit Links</h3>
                <p className="text-sm text-muted-foreground mb-2">Change the destination URL</p>
                <code className="text-xs bg-muted p-1 rounded block">/edit [link-id] https://new-url.com</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Delete Links</h3>
                <p className="text-sm text-muted-foreground mb-2">Remove a link</p>
                <code className="text-xs bg-muted p-1 rounded block">/delete [link-id]</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">QR Codes</h3>
                <p className="text-sm text-muted-foreground mb-2">Generate a QR code for a link</p>
                <code className="text-xs bg-muted p-1 rounded block">/qr [link-id]</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Set Expiration</h3>
                <p className="text-sm text-muted-foreground mb-2">Set an expiration date in days</p>
                <code className="text-xs bg-muted p-1 rounded block">/expire [link-id] [days]</code>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium">Help</h3>
                <p className="text-sm text-muted-foreground mb-2">Show available commands</p>
                <code className="text-xs bg-muted p-1 rounded block">/help</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
