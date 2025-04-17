import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LinkShortener, you agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
            <p>
              LinkShortener provides URL shortening services that allow users to create shortened links to web content.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
            <p>
              You agree not to use LinkShortener for any unlawful purposes or to conduct any unlawful activity,
              including, but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sharing links to illegal content</li>
              <li>Phishing or attempting to gather sensitive information</li>
              <li>Distributing malware or other harmful content</li>
              <li>Spamming or engaging in deceptive practices</li>
              <li>Violating intellectual property rights</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Account Security</h2>
            <p>
              You are responsible for maintaining the security of your account and password. LinkShortener cannot and
              will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Service Modifications</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the service with or without
              notice.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              LinkShortener shall not be liable for any indirect, incidental, special, consequential or punitive damages
              resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to update or change these Terms of Service at any time. Continued use of the service
              after any such changes constitutes your consent to such changes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
