"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user || null)
        setLoading(false)

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null)
          setLoading(false)

          // Refresh the page when auth state changes to ensure proper rendering
          if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
            router.refresh()
          }
        })

        return () => {
          authListener.subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth context error:", error)
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await supabase.auth.signInWithPassword({ email, password })
      return response
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const response = await supabase.auth.signOut()
      router.push("/")
      return response
    } catch (error) {
      console.error("Sign out error:", error)
      return { error }
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
