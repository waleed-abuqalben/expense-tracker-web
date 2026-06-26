"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  fetchBudgets,
  fetchBudget,
  createBudget as createBudgetApi,
  deleteTransaction as deleteTransactionApi,
} from "@/lib/api/apis"
import type { Budget as ApiBudget } from "@/types/budget"
import { mapApiBudget, type UiBudget } from "@/lib/budget-mapper"

// Owns transaction mutations for the budget identified by `budgetId` (the /budgets/[id] route param).
// Switching budgets is a navigation (router.push to a new /budgets/[id]), not local state, so the
// URL is always the single source of truth for which budget is selected.
export function useBudgets(budgetId: string) {
  const router = useRouter()
  const [budgets, setBudgets] = useState<UiBudget[]>([])
  const [budgetsError, setBudgetsError] = useState<string | null>(null)

  // Full list, used for the budget switcher dropdown and archived section. This only returns
  // summary totals (no itemized transactions), and races against the detail fetch below — merge
  // by id instead of overwriting so it doesn't clobber transactions the detail fetch already loaded.
  useEffect(() => {
    fetchBudgets()
      .then((list: any) => {
        const mapped: UiBudget[] = Array.isArray(list) ? list.map(mapApiBudget) : []
        setBudgets((prev) =>
          mapped.map((m) => {
            const existing = prev.find((p) => p.id === m.id)
            return existing ? { ...m, transactions: existing.transactions } : m
          }),
        )
      })
      .catch((err: any) => setBudgetsError(err?.message || "Failed to load budgets"))
  }, [])

  const currentBudget = budgets.find((b) => b.id === budgetId)

  // The /budgets list endpoint only returns summary totals, not itemized transactions —
  // fetch the full detail for whichever budget the URL points at.
  const refreshBudget = async (id: string | number) => {
    try {
      const b = await fetchBudget(id)
      if (!b) return
      const mapped = mapApiBudget(b as ApiBudget)
      setBudgets((prev) => {
        const found = prev.find((p) => p.id === String(b.id))
        return found ? prev.map((p) => (p.id === String(b.id) ? mapped : p)) : [...prev, mapped]
      })
    } catch (err) {
      console.warn("Failed to refresh budget:", err)
    }
  }

  useEffect(() => {
    if (!budgetId) return
    refreshBudget(budgetId)
  }, [budgetId])

  const deleteTransaction = async (transactionId: string) => {
    await deleteTransactionApi(transactionId)
    // backend totals (income/expense/net) need to be re-fetched after a delete
    await refreshBudget(budgetId)
  }

  // Creates a budget on the backend for the given month/year and navigates to it.
  const createBudget = async (payload: { month: number; year: number }) => {
    const created = await createBudgetApi(payload)
    const mapped = mapApiBudget(created as ApiBudget)
    setBudgets((prev) => [...prev, mapped])
    router.push(`/budgets/${mapped.id}`)
    return mapped
  }

  const selectBudget = (id: string) => {
    router.push(`/budgets/${id}`)
  }

  return {
    budgets,
    budgetsError,
    currentBudget,
    selectBudget,
    refreshBudget,
    deleteTransaction,
    createBudget,
  }
}
