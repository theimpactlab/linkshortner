"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function AuthDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSessionInfo(data.session)
    }

    checkSession()
  }, [])

  if (!sessionInfo) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Issue</AlertTitle>
        <AlertDescription>
          No active session detected. You may need to log in again.
          <Button variant="outline" size="sm" className="ml-2" onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {showDebug && (
        <Alert className="mb-4">
          <AlertTitle>Debug Info (Admin Only)</AlertTitle>
          <AlertDescription>
            <div className="text-xs mt-2">
              <p>User ID: {sessionInfo.user?.id}</p>
              <p>Email: {sessionInfo.user?.email}</p>
              <p>Session Expires: {new Date(sessionInfo.expires_at * 1000).toLocaleString()}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <div className="text-right mb-4">
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </div>
    </>
  )
}
