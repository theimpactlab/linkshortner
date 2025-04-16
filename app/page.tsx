import { LinkShortenerForm } from "@/components/link-shortener-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Link Shortener</h1>
          <p className="text-center text-muted-foreground mb-8">
            Create short, memorable links that redirect to your long URLs.
          </p>
          <LinkShortenerForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
