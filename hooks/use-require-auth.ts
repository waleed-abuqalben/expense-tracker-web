"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirects to /login if there's no session token.
export function useRequireAuth() {
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/login")
    }
  }, [router])
}
