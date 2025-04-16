import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function TelegramBotPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Telegram Bot Setup</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setting Up Your Telegram Bot</CardTitle>
            <CardDescription>Follow these steps to configure your Telegram bot for link shortening</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Create a Telegram Bot</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Open Telegram and search for @BotFather</li>
                <li>Start a chat with BotFather and send the command /newbot</li>
                <li>Follow the instructions to name your bot</li>
                <li>Once created, BotFather will provide you with a token</li>
                <li>Save this token as you'll need it for the next step</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Configure Your Bot Token</h3>
              <p>Add your Telegram bot token to your environment variables:</p>
              <div className="rounded-md border p-4 bg-muted">
                <p className="font-mono">TELEGRAM_BOT_TOKEN=your_bot_token_here</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Set Up Webhook</h3>
              <p>Configure your bot to use a webhook by making a request to the Telegram API:</p>
              <div className="rounded-md border p-4 bg-muted overflow-x-auto">
                <p className="font-mono">
                  https://api.telegram.org/bot{"{YOUR_BOT_TOKEN}"}/setWebhook?url={"{YOUR_DOMAIN}"}/api/telegram
                </p>
              </div>
              <p>
                Replace {"{YOUR_BOT_TOKEN}"} with your actual bot token and {"{YOUR_DOMAIN}"} with your website domain.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 4: Test Your Bot</h3>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Open Telegram and search for your bot by username</li>
                <li>Start a chat with your bot</li>
                <li>Send a URL to your bot (e.g., https://example.com)</li>
                <li>Your bot should respond with a shortened link</li>
              </ol>
            </div>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                Your webhook URL must be HTTPS. If you're testing locally, consider using a service like ngrok to create
                a temporary public HTTPS URL.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
