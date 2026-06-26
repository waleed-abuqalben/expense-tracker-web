"use client"

import { useEffect, useState } from "react"
import type { CategoryDto } from "@/types/budget"

export function useCategories(type: "INCOME" | "EXPENSE", isOpen: boolean) {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoadingCategories(true)
    setError(null)

    import("@/lib/api/apis")
      .then(({ fetchCategories }) => fetchCategories(type))
      .then((list: any) => setCategories(Array.isArray(list) ? list : []))
      .catch((err: any) => setError(err?.message || "Failed to load categories"))
      .finally(() => setLoadingCategories(false))
  }, [isOpen, type])

  return { categories, loadingCategories, error }
}
