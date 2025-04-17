import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About LinkShortener</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              LinkShortener is a powerful URL shortening service designed to make your long URLs more manageable and
              trackable.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to provide a simple, reliable, and feature-rich link shortening service that helps
              individuals and businesses share links more effectively.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Custom short links with your preferred alias</li>
              <li>Link analytics to track clicks and visitor information</li>
              <li>Link expiration options for temporary content</li>
              <li>QR code generation for easy sharing</li>
              <li>Telegram bot integration</li>
              <li>User management with different permission levels</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Technology</h2>
            <p>
              LinkShortener is built with modern web technologies including Next.js, React, Supabase, and Tailwind CSS.
              This stack ensures high performance, reliability, and a great user experience.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
