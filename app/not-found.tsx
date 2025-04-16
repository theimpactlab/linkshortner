import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">404 - Link Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The short link you're looking for doesn't exist or has been deactivated.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </main>
      <Footer />
    </div>
  )
}
