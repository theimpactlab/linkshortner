import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function CustomDomainPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Custom Domain Setup</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Setting Up Your Custom Domain</CardTitle>
            <CardDescription>
              Follow these steps to configure your custom domain with our link shortener
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Custom domains are available for users on paid plans. Please upgrade your account to access this
                feature.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Register Your Domain</h3>
              <p>Register a domain with your preferred domain registrar (e.g., Namecheap, GoDaddy, Google Domains).</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Configure DNS Settings</h3>
              <p>Add the following DNS records to your domain:</p>
              <div className="rounded-md border p-4 bg-muted">
                <p className="font-mono">Type: A</p>
                <p className="font-mono">Name: @ (or leave blank)</p>
                <p className="font-mono">Value: 76.76.21.21</p>
                <p className="font-mono">TTL: 3600 (or default)</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Verify Domain Ownership</h3>
              <p>Add a TXT record to verify your domain ownership:</p>
              <div className="rounded-md border p-4 bg-muted">
                <p className="font-mono">Type: TXT</p>
                <p className="font-mono">Name: _verify</p>
                <p className="font-mono">Value: linkshortener-verification=YOUR_VERIFICATION_CODE</p>
                <p className="font-mono">TTL: 3600 (or default)</p>
              </div>
              <p>Your verification code will be provided after upgrading to a paid plan.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 4: Configure Supabase Custom Domain</h3>
              <p>
                Supabase supports custom domains for projects on paid plans. Follow these steps to set up your custom
                domain with Supabase [^1]:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Add a CNAME record pointing to your Supabase project URL</li>
                <li>Verify ownership of the domain by adding TXT records</li>
                <li>Activate your domain in the Supabase dashboard</li>
              </ol>
              <p>
                For detailed instructions, refer to the{" "}
                <a
                  href="https://supabase.com/docs/guides/platform/custom-domains"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase Custom Domains documentation
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 5: Update Your Application</h3>
              <p>
                After your domain is verified and active, update your application settings to use your custom domain for
                shortened links.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
