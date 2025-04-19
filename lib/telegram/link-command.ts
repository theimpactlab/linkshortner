import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function handleLinkCommand(message: any, args: string[]) {
  const chatId = message.chat.id

  if (args.length < 1) {
    return {
      text: "Please provide a link code.\nExample: /link ABC123",
      chat_id: chatId,
    }
  }

  const linkCode = args[0]

  try {
    const supabase = createServerSupabaseClient()

    // Find the link code in the database
    const { data: linkData, error: linkError } = await supabase
      .from("telegram_link_codes")
      .select("user_id")
      .eq("code", linkCode)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (linkError || !linkData) {
      return {
        text: "Invalid or expired link code. Please generate a new code from the website.",
        chat_id: chatId,
      }
    }

    // Check if this Telegram chat is already linked to a user
    const { data: existingLink } = await supabase
      .from("telegram_users")
      .select("id")
      .eq("telegram_chat_id", chatId.toString())
      .single()

    if (existingLink) {
      // Update the existing link
      await supabase
        .from("telegram_users")
        .update({ user_id: linkData.user_id })
        .eq("telegram_chat_id", chatId.toString())
    } else {
      // Create a new link
      await supabase.from("telegram_users").insert({
        user_id: linkData.user_id,
        telegram_chat_id: chatId.toString(),
      })
    }

    // Delete the used link code
    await supabase.from("telegram_link_codes").delete().eq("code", linkCode)

    return {
      text: "✅ Your Telegram account has been successfully linked! You can now manage your links via chat.",
      chat_id: chatId,
    }
  } catch (error) {
    console.error("Error linking Telegram account:", error)
    return {
      text: "An error occurred while linking your account. Please try again later.",
      chat_id: chatId,
    }
  }
}
