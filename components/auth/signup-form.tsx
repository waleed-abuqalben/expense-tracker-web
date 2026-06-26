"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerRequest } from "@/lib/api/apis"

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

function validate(username: string, email: string, password: string): string | null {
  if (username.length < 3 || username.length > 50) {
    return "Username must be between 3 and 50 characters."
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return "Invalid email format."
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return "Password must be at least 8 characters long, contain one lowercase, one uppercase, one digit, and one special character (@$!%*?&)."
  }
  return null
}

export default function SignupForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validate(username, email, password)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setLoading(true)
    try {
      await registerRequest(username, email, password)
      // token saved in localStorage/cookie by registerRequest
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border rounded">
      <h2 className="text-xl font-semibold mb-4">Create an account</h2>

      <div className="mb-4">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="janedoe"
          required
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          At least 8 characters, with uppercase, lowercase, a digit, and a special character (@$!%*?&).
        </p>
      </div>

      {error && <div className="text-sm text-destructive mb-3">{error}</div>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
