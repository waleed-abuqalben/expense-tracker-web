import { BASE_URL } from "./constants"
import { extractErrorMessage } from "./utils"

export interface StoredUser {
  username?: string
  email?: string
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token)
    try {
      const maxAge = 60 * 60 * 24 * 7 // 7 days
      document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
    } catch (e) {
      // ignore cookie failures
    }
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax"
  clearUser()
}

export function setUser(user: StoredUser) {
  if (typeof window === "undefined") return
  localStorage.setItem("user", JSON.stringify(user))
}

export function getUser(): StoredUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem("user")
}

// Backend has no /me endpoint, so username/email is read from the login/register
// response if present, falling back to whatever claims the JWT carries.
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * Call auth login endpoint and store token if returned.
 */
export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(extractErrorMessage(json, "Login failed"))

  const token = json?.data?.token
  if (token) setToken(token)

  const claims = token ? decodeJwtPayload(token) : null
  const username = json?.data?.user?.username ?? json?.data?.username ?? claims?.username ?? claims?.name
  setUser({ username, email: json?.data?.user?.email ?? json?.data?.email ?? claims?.email ?? email })

  return json
}

/**
 * Call auth register endpoint and store token if returned (backend logs the user in immediately).
 */
export async function registerRequest(username: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(extractErrorMessage(json, "Registration failed"))

  const token = json?.data?.token ?? json?.token
  if (token) setToken(token)

  setUser({
    username: json?.data?.user?.username ?? json?.data?.username ?? username,
    email: json?.data?.user?.email ?? json?.data?.email ?? email,
  })

  return json
}

/**
 * Use for subsequent API calls that need the stored token.
 */
export async function fetchWithAuth(path: string, opts: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`
  const token = getToken()
  const headers = {
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(url, { ...opts, headers })

  if (res.status === 401 && typeof window !== "undefined") {
    clearToken()
    if (window.location.pathname !== "/login") {
      const from = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?from=${from}`
    }
  }

  return res
}
