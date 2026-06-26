"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Home as HomeIcon, LogOut, Repeat, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { clearToken, getToken, getUser, type StoredUser } from "@/lib/api/apis"

const navItems = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Recurring", href: "/recurring-transactions", icon: Repeat },
]

const AUTH_ROUTES = ["/login", "/signup"]

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<StoredUser | null>(null)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    setHasToken(!!getToken())
    setUser(getUser())
  }, [pathname])

  if (!hasToken || AUTH_ROUTES.includes(pathname)) return null

  const handleLogout = () => {
    clearToken()
    router.push("/login")
  }

  const displayName = user?.username || "there"

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2", active && "font-medium")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{displayName}</span>
          <div
            aria-hidden
            className="h-9 w-9 shrink-0 rounded-full border border-border bg-muted"
          />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
