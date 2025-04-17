"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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

  useEffect(() => {
    // Set up the auth state listener
    const setupAuthListener = async () => {
      try {
        // Get the initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)

        // Set up the auth state change listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null)

          // Handle auth state changes
          if (event === "SIGNED_IN" && session) {
            console.log("User signed in:", session.user)
          } else if (event === "SIGNED_OUT") {
            console.log("User signed out")
          }
        })

        setLoading(false)

        // Clean up the listener on unmount
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Error setting up auth listener:", error)
        setLoading(false)
      }
    }

    setupAuthListener()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password })
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const response = await supabase.auth.signOut()
      // Use window.location for a hard navigation after sign out
      window.location.href = "/"
      return response
    } catch (error) {
      console.error("Sign out error:", error)
      return { error }
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
