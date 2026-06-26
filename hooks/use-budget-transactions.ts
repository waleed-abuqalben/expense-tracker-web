"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchTransactionsByBudget } from "@/lib/api/apis"
import { mapApiTransaction } from "@/lib/budget-mapper"
import { TransactionType, type Transaction } from "@/types/transaction"
import { useToggleGroup } from "@/hooks/use-toggle-group"

export interface TransactionGroup {
  transactions: Transaction[]
  total: number
  type: TransactionType
  label: string
}

// Fetches a budget's transactions from the backend for the selected filter — "all" omits the
// `type` query param, "INCOME"/"EXPENSE" send it — and groups the result by type+category for
// the collapsible UI. Call `refetch` after creating/editing/deleting a transaction.
export function useBudgetTransactions(budgetId: string) {
  const [filter, setFilter] = useState<"all" | TransactionType>("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { expandedGroups, toggleGroup } = useToggleGroup()

  const load = useCallback(async () => {
    if (!budgetId) return
    setLoading(true)
    setError(null)
    try {
      const type = filter === "all" ? undefined : filter
      const list = await fetchTransactionsByBudget(budgetId, type)
      setTransactions(Array.isArray(list) ? list.map(mapApiTransaction) : [])
    } catch (err: any) {
      setError(err?.message || "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [budgetId, filter])

  useEffect(() => {
    load()
  }, [load])

  const groups: { [key: string]: TransactionGroup } = {}

  transactions.forEach((t) => {
    const groupKey = `${t.type}-${t.category}`
    if (!groups[groupKey]) {
      groups[groupKey] = {
        transactions: [],
        total: 0,
        type: t.type,
        label: t.category || (t.type === TransactionType.INCOME ? "Income" : "Expense"),
      }
    }
    groups[groupKey].transactions.push(t)
    groups[groupKey].total += t.amount
  })

  Object.values(groups).forEach((group) => {
    group.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  return { filter, setFilter, loading, error, expandedGroups, toggleGroup, groups, refetch: load }
}
