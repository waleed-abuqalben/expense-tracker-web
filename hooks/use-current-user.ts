"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getToken, getUser, type StoredUser } from "@/lib/api/apis"

// Redirects to /login if there's no session token, otherwise exposes the stored user.
export function useCurrentUser() {
  const router = useRouter()
  const [user, setUserState] = useState<StoredUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace("/login")
      return
    }
    setUserState(getUser())
    setLoading(false)
  }, [router])

  return { user, loading }
}
