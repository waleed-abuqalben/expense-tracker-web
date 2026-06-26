"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchBudgets, createBudget as createBudgetApi } from "@/lib/api/apis"
import type { Budget } from "@/types/budget"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MonthYearSelect } from "@/components/month-year-select"
import { useCreateBudget } from "@/hooks/use-create-budget"
import { Filter, Plus } from "lucide-react"

export default function BudgetsPage() {
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState<"all" | number>("all")

  const loadBudgets = () => {
    setLoading(true)
    setError(null)
    return fetchBudgets()
      .then((data) => setBudgets(Array.isArray(data) ? data : []))
      .catch((err: any) => setError(err?.message || "Failed to load budgets"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  const createBudgetForm = useCreateBudget({
    onSubmit: async (payload) => {
      const created = await createBudgetApi(payload)
      await loadBudgets()
      router.push(`/budgets/${(created as Budget).id}`)
    },
  })

  const years = useMemo(
    () => Array.from(new Set(budgets.map((b) => b.year))).sort((a, b) => b - a),
    [budgets],
  )

  const filteredBudgets =
    yearFilter === "all" ? budgets : budgets.filter((b) => b.year === yearFilter)

  const selectBudget = (budget: Budget) => {
    router.push(`/budgets/${budget.id}`)
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Filter by year">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setYearFilter("all")} className={yearFilter === "all" ? "bg-accent" : ""}>
              All
            </DropdownMenuItem>
            {years.map((y) => (
              <DropdownMenuItem
                key={y}
                onClick={() => setYearFilter(y)}
                className={yearFilter === y ? "bg-accent" : ""}
              >
                {y}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={() => createBudgetForm.setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {loading ? (
        <div>Loading budgets…</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-muted-foreground">No budgets found for your account.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredBudgets.map((b) => (
            <Card
              key={b.id}
              onClick={() => selectBudget(b)}
              className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="font-medium">
                  {new Date(b.year, b.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Net: {b.netBalance.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Status: {b.status}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createBudgetForm.open} onOpenChange={(open) => { if (!open) createBudgetForm.close() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <MonthYearSelect
              month={createBudgetForm.month}
              year={createBudgetForm.year}
              onMonthChange={createBudgetForm.setMonth}
              onYearChange={createBudgetForm.setYear}
            />

            {createBudgetForm.error && <div className="text-destructive text-sm">{createBudgetForm.error}</div>}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={createBudgetForm.close} className="flex-1">Cancel</Button>
              <Button
                onClick={createBudgetForm.submit}
                className="flex-1"
                disabled={createBudgetForm.submitting}
              >
                {createBudgetForm.submitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
