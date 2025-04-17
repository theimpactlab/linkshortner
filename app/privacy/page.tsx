import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p>When you use LinkShortener, we collect certain information to provide and improve our services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information: email address and password (encrypted)</li>
              <li>Usage data: links created, clicks, and other interactions with our service</li>
              <li>Link analytics: referrer, user agent, and IP address (anonymized) of link visitors</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve and personalize your experience</li>
              <li>Generate analytics and statistics about link performance</li>
              <li>Communicate with you about service updates</li>
              <li>Prevent abuse and ensure security</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide you with our services. You can
              request deletion of your account and associated data at any time.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of
              transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
