import { handleTelegramWebhook } from "@/lib/telegram/bot"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  return handleTelegramWebhook(request)
}
