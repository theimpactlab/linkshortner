import { createShortLink, updateLink, deleteLink } from "@/lib/actions/link-actions"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { handleLinkCommand } from "./link-command"
import type { Link } from "@/lib/types"

// Command types
type TelegramCommand = {
  command: string
  description: string
  handler: (message: any, args: string[], userId: string | null) => Promise<Response>
}

// This would be a serverless function or Edge Function that handles Telegram webhook
export async function handleTelegramWebhook(req: Request) {
  try {
    const data = await req.json()

    // Check if it's a message
    if (!data.message) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { message } = data
    const chatId = message.chat.id
    const text = message.text || ""

    // Get the base URL from environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"

    // Process commands
    if (text.startsWith("/")) {
      const parts = text.split(" ")
      const commandName = parts[0].toLowerCase()
      const args = parts.slice(1)

      // Special case for link command (doesn't require authentication)
      if (commandName === "/link") {
        const response = await handleLinkCommand(message, args)
        return sendTelegramMessage(chatId, response.text)
      }

      // Check if the user is authenticated
      const userId = await getUserIdFromTelegram(chatId)

      // Find the command handler
      const command = commands.find((cmd) => `/${cmd.command}` === commandName)

      if (command) {
        return command.handler(message, args, userId)
      } else if (commandName === "/start" || commandName === "/help") {
        return sendHelpMessage(chatId)
      } else {
        return sendTelegramMessage(chatId, "Unknown command. Type /help to see available commands.")
      }
    }

    // Check if the user is authenticated for non-command messages
    const userId = await getUserIdFromTelegram(chatId)

    // If not a command, try to shorten a URL
    let url
    try {
      // Simple URL extraction from text
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const matches = text.match(urlRegex)

      if (matches && matches.length > 0) {
        url = matches[0]
      }
    } catch (error) {
      console.error("Error extracting URL:", error)
    }

    if (!url) {
      return sendTelegramMessage(
        chatId,
        "Please send a valid URL to shorten or use a command. Type /help to see available commands.",
      )
    }

    // Create short link
    const result = await createShortLink(url, undefined, undefined, userId || undefined)

    if (result.error) {
      return sendTelegramMessage(chatId, `Error: ${result.error}`)
    }

    const shortUrl = `${baseUrl}/${result.shortCode}`

    return sendTelegramMessage(
      chatId,
      `✅ Link shortened successfully!\n\nOriginal: ${url}\nShortened: ${shortUrl}\n\nUse /custom to create a custom link.`,
    )
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return new Response(JSON.stringify({ ok: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Command handlers
const commands: TelegramCommand[] = [
  {
    command: "custom",
    description: "Create a custom short link: /custom [URL] [custom-code]",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (args.length < 2) {
        return sendTelegramMessage(
          chatId,
          "Please provide both a URL and custom code.\nExample: /custom https://example.com my-link",
        )
      }

      const url = args[0]
      const customCode = args[1]

      try {
        // Validate URL
        new URL(url)
      } catch (error) {
        return sendTelegramMessage(chatId, "Please provide a valid URL.")
      }

      // Create custom short link
      const result = await createShortLink(url, customCode)

      if (result.error) {
        return sendTelegramMessage(chatId, `Error: ${result.error}`)
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
      const shortUrl = `${baseUrl}/${result.shortCode}`

      return sendTelegramMessage(
        chatId,
        `✅ Custom link created successfully!\n\nOriginal: ${url}\nShortened: ${shortUrl}`,
      )
    },
  },
  {
    command: "list",
    description: "List your shortened links",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (!userId) {
        return sendTelegramMessage(
          chatId,
          "You need to link your Telegram account to use this feature. Please visit the website to set up your account.",
        )
      }

      try {
        // Get user's links
        const supabase = createServerSupabaseClient()
        const { data: links, error } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) {
          throw error
        }

        if (!links || links.length === 0) {
          return sendTelegramMessage(chatId, "You don't have any shortened links yet.")
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
        let message = "Your recent links:\n\n"

        links.forEach((link: Link, index: number) => {
          const shortUrl = `${baseUrl}/${link.short_code}`
          message += `${index + 1}. ${shortUrl}\n`
          message += `   Original: ${truncateUrl(link.original_url)}\n`
          message += `   Clicks: ${link.clicks}\n`
          message += `   ID: ${link.id}\n\n`
        })

        message += "To manage a link, use /edit, /delete, /qr, or /expire commands with the link ID."

        return sendTelegramMessage(chatId, message)
      } catch (error) {
        console.error("Error listing links:", error)
        return sendTelegramMessage(chatId, "Failed to retrieve your links. Please try again later.")
      }
    },
  },
  {
    command: "edit",
    description: "Edit a link: /edit [link-id] [new-url]",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (!userId) {
        return sendTelegramMessage(
          chatId,
          "You need to link your Telegram account to use this feature. Please visit the website to set up your account.",
        )
      }

      if (args.length < 2) {
        return sendTelegramMessage(
          chatId,
          "Please provide both a link ID and new URL.\nExample: /edit abc123 https://example.com",
        )
      }

      const linkId = args[0]
      const newUrl = args[1]

      try {
        // Validate URL
        new URL(newUrl)
      } catch (error) {
        return sendTelegramMessage(chatId, "Please provide a valid URL.")
      }

      try {
        // Check if the link belongs to the user
        const supabase = createServerSupabaseClient()
        const { data: link, error: fetchError } = await supabase
          .from("links")
          .select("*")
          .eq("id", linkId)
          .eq("user_id", userId)
          .single()

        if (fetchError || !link) {
          return sendTelegramMessage(chatId, "Link not found or you don't have permission to edit it.")
        }

        // Update the link
        const result = await updateLink(linkId, { original_url: newUrl })

        if (result.error) {
          return sendTelegramMessage(chatId, `Error: ${result.error}`)
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
        const shortUrl = `${baseUrl}/${link.short_code}`

        return sendTelegramMessage(
          chatId,
          `✅ Link updated successfully!\n\nShort link: ${shortUrl}\nNew destination: ${newUrl}`,
        )
      } catch (error) {
        console.error("Error editing link:", error)
        return sendTelegramMessage(chatId, "Failed to update the link. Please try again later.")
      }
    },
  },
  {
    command: "delete",
    description: "Delete a link: /delete [link-id]",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (!userId) {
        return sendTelegramMessage(
          chatId,
          "You need to link your Telegram account to use this feature. Please visit the website to set up your account.",
        )
      }

      if (args.length < 1) {
        return sendTelegramMessage(chatId, "Please provide a link ID.\nExample: /delete abc123")
      }

      const linkId = args[0]

      try {
        // Check if the link belongs to the user
        const supabase = createServerSupabaseClient()
        const { data: link, error: fetchError } = await supabase
          .from("links")
          .select("short_code")
          .eq("id", linkId)
          .eq("user_id", userId)
          .single()

        if (fetchError || !link) {
          return sendTelegramMessage(chatId, "Link not found or you don't have permission to delete it.")
        }

        // Delete the link
        const result = await deleteLink(linkId)

        if (result.error) {
          return sendTelegramMessage(chatId, `Error: ${result.error}`)
        }

        return sendTelegramMessage(chatId, `✅ Link with ID ${linkId} has been deleted successfully.`)
      } catch (error) {
        console.error("Error deleting link:", error)
        return sendTelegramMessage(chatId, "Failed to delete the link. Please try again later.")
      }
    },
  },
  {
    command: "qr",
    description: "Generate QR code for a link: /qr [link-id]",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (!userId) {
        return sendTelegramMessage(
          chatId,
          "You need to link your Telegram account to use this feature. Please visit the website to set up your account.",
        )
      }

      if (args.length < 1) {
        return sendTelegramMessage(chatId, "Please provide a link ID.\nExample: /qr abc123")
      }

      const linkId = args[0]

      try {
        // Check if the link belongs to the user
        const supabase = createServerSupabaseClient()
        const { data: link, error: fetchError } = await supabase
          .from("links")
          .select("short_code")
          .eq("id", linkId)
          .eq("user_id", userId)
          .single()

        if (fetchError || !link) {
          return sendTelegramMessage(chatId, "Link not found or you don't have permission to access it.")
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
        const shortUrl = `${baseUrl}/${link.short_code}`

        // Generate QR code using Google Charts API
        const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(
          shortUrl,
        )}&choe=UTF-8`

        // Send QR code image
        return sendTelegramPhoto(chatId, qrCodeUrl, `QR code for ${shortUrl}`)
      } catch (error) {
        console.error("Error generating QR code:", error)
        return sendTelegramMessage(chatId, "Failed to generate QR code. Please try again later.")
      }
    },
  },
  {
    command: "expire",
    description: "Set expiration date for a link: /expire [link-id] [days]",
    handler: async (message, args, userId) => {
      const chatId = message.chat.id

      if (!userId) {
        return sendTelegramMessage(
          chatId,
          "You need to link your Telegram account to use this feature. Please visit the website to set up your account.",
        )
      }

      if (args.length < 2) {
        return sendTelegramMessage(chatId, "Please provide a link ID and number of days.\nExample: /expire abc123 7")
      }

      const linkId = args[0]
      const days = Number.parseInt(args[1], 10)

      if (isNaN(days) || days < 1) {
        return sendTelegramMessage(chatId, "Please provide a valid number of days (minimum 1).")
      }

      try {
        // Check if the link belongs to the user
        const supabase = createServerSupabaseClient()
        const { data: link, error: fetchError } = await supabase
          .from("links")
          .select("short_code")
          .eq("id", linkId)
          .eq("user_id", userId)
          .single()

        if (fetchError || !link) {
          return sendTelegramMessage(chatId, "Link not found or you don't have permission to modify it.")
        }

        // Calculate expiration date
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + days)

        // Update the link with expiration date
        const result = await updateLink(linkId, { expires_at: expirationDate.toISOString() })

        if (result.error) {
          return sendTelegramMessage(chatId, `Error: ${result.error}`)
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
        const shortUrl = `${baseUrl}/${link.short_code}`

        return sendTelegramMessage(
          chatId,
          `✅ Expiration set successfully!\n\nLink: ${shortUrl}\nWill expire in: ${days} days\nExpiration date: ${expirationDate.toLocaleDateString()}`,
        )
      } catch (error) {
        console.error("Error setting expiration:", error)
        return sendTelegramMessage(chatId, "Failed to set expiration date. Please try again later.")
      }
    },
  },
]

// Helper function to send a message
async function sendTelegramMessage(chatId: number, text: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN

  if (!telegramToken) {
    console.error("Telegram bot token not configured")
    return new Response(JSON.stringify({ ok: false, error: "Bot not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  })

  const responseData = await response.json()

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

// Helper function to send a photo
async function sendTelegramPhoto(chatId: number, photoUrl: string, caption: string) {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN

  if (!telegramToken) {
    console.error("Telegram bot token not configured")
    return new Response(JSON.stringify({ ok: false, error: "Bot not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const response = await fetch(`https://api.telegram.org/bot${telegramToken}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
    }),
  })

  const responseData = await response.json()

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

// Helper function to send help message
async function sendHelpMessage(chatId: number) {
  let helpText = "🔗 *Link Shortener Bot* 🔗\n\n"
  helpText += "I can help you create and manage shortened links. Here are the available commands:\n\n"

  // Add general usage
  helpText += "📋 *General Usage*:\n"
  helpText += "Simply send me any URL and I'll shorten it for you.\n\n"

  // Add commands
  helpText += "🛠 *Commands*:\n"
  commands.forEach((cmd) => {
    helpText += `/${cmd.command} - ${cmd.description}\n`
  })

  helpText += "\n/help - Show this help message"

  return sendTelegramMessage(chatId, helpText)
}

// Helper function to get user ID from Telegram chat ID
async function getUserIdFromTelegram(chatId: number): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("telegram_users")
      .select("user_id")
      .eq("telegram_chat_id", chatId.toString())
      .single()

    if (error || !data) {
      return null
    }

    return data.user_id
  } catch (error) {
    console.error("Error getting user ID from Telegram:", error)
    return null
  }
}

// Helper function to truncate long URLs
function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) {
    return url
  }
  return url.substring(0, maxLength - 3) + "..."
}
