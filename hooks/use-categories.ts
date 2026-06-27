"use client"

import { useCallback, useEffect, useState } from "react"
import type { CategoryDto } from "@/types/budget"

export function useCategories(type: "INCOME" | "EXPENSE", isOpen: boolean) {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadingCategories(true)
    setError(null)
    try {
      const { fetchCategories } = await import("@/lib/api/apis")
      const list = await fetchCategories(type)
      setCategories(Array.isArray(list) ? list : [])
    } catch (err: any) {
      setError(err?.message || "Failed to load categories")
    } finally {
      setLoadingCategories(false)
    }
  }, [type])

  useEffect(() => {
    if (!isOpen) return
    load()
  }, [isOpen, load])

  return { categories, loadingCategories, error, refetch: load }
}
