"use client"

import { useCallback, useEffect, useState } from "react"
import {
  fetchRecurringTransactions,
  deleteRecurringTransaction as deleteRecurringTransactionApi,
  setRecurringTransactionActive as setRecurringTransactionActiveApi,
} from "@/lib/api/apis"
import type { RecurringTransactionDto } from "@/types/recurring-transaction"
import { useToggleGroup } from "@/hooks/use-toggle-group"

export interface RecurringTransactionGroup {
  items: RecurringTransactionDto[]
  total: number
  categoryType: "INCOME" | "EXPENSE"
  categoryName: string
}

// Owns the recurring transactions list plus the mutations (toggle/delete) that affect it, and
// groups the result by type+category for the same collapsible UI the budget transactions use.
export function useRecurringTransactions() {
  const [filter, setFilter] = useState<"all" | "INCOME" | "EXPENSE">("all")
  const [items, setItems] = useState<RecurringTransactionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { expandedGroups, toggleGroup } = useToggleGroup()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const type = filter === "all" ? undefined : filter
      const data = await fetchRecurringTransactions(type)
      setItems(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || "Failed to load recurring transactions")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const toggleActive = async (id: number, active: boolean) => {
    const updated = await setRecurringTransactionActiveApi(id, active)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: updated?.active ?? active } : item)),
    )
  }

  const remove = async (id: number) => {
    await deleteRecurringTransactionApi(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const groups: { [key: string]: RecurringTransactionGroup } = {}

  items.forEach((item) => {
    const groupKey = `${item.categoryType}-${item.categoryName}`
    if (!groups[groupKey]) {
      groups[groupKey] = {
        items: [],
        total: 0,
        categoryType: item.categoryType,
        categoryName: item.categoryName,
      }
    }
    groups[groupKey].items.push(item)
    groups[groupKey].total += item.amount
  })

  return {
    filter,
    setFilter,
    items,
    loading,
    error,
    reload: load,
    toggleActive,
    remove,
    groups,
    expandedGroups,
    toggleGroup,
  }
}
