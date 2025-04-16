import { createShortLink } from "@/lib/actions/link-actions"

// This would be a serverless function or Edge Function that handles Telegram webhook
export async function handleTelegramWebhook(req: Request) {
  try {
    const data = await req.json()

    // Check if it's a message
    if (!data.message || !data.message.text) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { message } = data
    const chatId = message.chat.id
    const text = message.text

    // Check if it's a URL
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
      return sendTelegramMessage(chatId, "Please send a valid URL to shorten. Example: https://example.com")
    }

    // Create short link
    const result = await createShortLink(url)

    if (result.error) {
      return sendTelegramMessage(chatId, `Error: ${result.error}`)
    }

    // Get the base URL from environment variable or default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"
    const shortUrl = `${baseUrl}/${result.shortCode}`

    return sendTelegramMessage(chatId, `✅ Link shortened successfully!\n\nOriginal: ${url}\nShortened: ${shortUrl}`)
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return new Response(JSON.stringify({ ok: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

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
