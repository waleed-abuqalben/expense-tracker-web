"use client"

import { useState, useEffect } from "react"
import type { Transaction as AppTransaction } from "@/types/transaction"
import { TransactionType } from "@/types/transaction"
import { useCategories } from "@/hooks/use-categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (transaction: {
    id?: string
    amount: string
    name: string
    description: string
    category: string
    date: string
  }) => void
  isArchived?: boolean
  currentBudgetId?: string
  budgetMonth?: number
  budgetYear?: number
  onCreate?: (createdDto: any) => void
  editingTransaction?: AppTransaction | null
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  isArchived = false,
  currentBudgetId,
  budgetMonth,
  budgetYear,
  editingTransaction = null,
  onCreate,
}: TransactionModalProps) {
  const getBudgetDateRange = () => {
    if (!budgetMonth || !budgetYear) return { min: undefined, max: undefined, defaultDate: new Date().toISOString().split("T")[0] }
    const mm = String(budgetMonth).padStart(2, "0")
    const lastDay = new Date(budgetYear, budgetMonth, 0).getDate()
    const min = `${budgetYear}-${mm}-01`
    const max = `${budgetYear}-${mm}-${String(lastDay).padStart(2, "0")}`
    const today = new Date().toISOString().split("T")[0]
    const defaultDate = today >= min && today <= max ? today : min
    return { min, max, defaultDate }
  }

  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE)
  const [transaction, setTransaction] = useState({
    amount: "",
    name: "",
    description: "",
    category: "",
    date: getBudgetDateRange().defaultDate,
    budgetId: "",
  })

  const categoryType = transactionType === TransactionType.INCOME ? "INCOME" : "EXPENSE"
  const { categories, loadingCategories, refetch: refetchCategories } = useCategories(categoryType, isOpen)
  const [error, setError] = useState<string | null>(null)

  // Create-category mini dialog state
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [createCategorySubmitting, setCreateCategorySubmitting] = useState(false)
  const [createCategoryError, setCreateCategoryError] = useState<string | null>(null)

  // Load existing transaction into form, or reset for a new one
  useEffect(() => {
    if (editingTransaction) {
      setTransactionType(editingTransaction.type)
      setTransaction({
        amount: editingTransaction.amount.toString(),
        name: editingTransaction.name,
        description: editingTransaction.description,
        category: editingTransaction.category || "",
        date: editingTransaction.date,
        budgetId: currentBudgetId || "",
      })
    } else {
      setTransactionType(TransactionType.EXPENSE)
      setTransaction({
        amount: "",
        name: "",
        description: "",
        category: "",
        date: getBudgetDateRange().defaultDate,
        budgetId: "",
      })
    }
  }, [editingTransaction, isOpen])

  // Select proper category when editing
  useEffect(() => {
    if (!isOpen || !editingTransaction || categories.length === 0) return

    const original = editingTransaction.category ?? ""

    const byId = categories.find((c) => String(c.id) === String(original))
    if (byId) {
      setTransaction((prev) => ({ ...prev, category: String(byId.id) }))
      return
    }

    const byName = categories.find(
      (c) => (c.name ?? "").toLowerCase() === (original ?? "").toLowerCase()
    )
    if (byName) {
      setTransaction((prev) => ({ ...prev, category: String(byName.id) }))
      return
    }

    setTransaction((prev) => ({ ...prev, category: "" }))
  }, [categories, editingTransaction, isOpen])

  const handleTypeChange = (newType: TransactionType) => {
    setTransactionType(newType)
    setTransaction((prev) => ({ ...prev, category: "" }))
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setCreateCategorySubmitting(true)
    setCreateCategoryError(null)
    try {
      const { createCategory } = await import("@/lib/api/apis")
      const created = await createCategory({ name: newCategoryName.trim(), type: categoryType })
      await refetchCategories()
      setTransaction((prev) => ({ ...prev, category: String(created?.id) }))
      setNewCategoryName("")
      setCreateCategoryOpen(false)
    } catch (err: any) {
      setCreateCategoryError(err?.message || "Failed to create category")
    } finally {
      setCreateCategorySubmitting(false)
    }
  }

  const closeCreateCategory = () => {
    setCreateCategoryOpen(false)
    setNewCategoryName("")
    setCreateCategoryError(null)
  }

  // ---------- SUBMIT ----------
  const handleSubmit = () => {
    if (!transaction.amount || !transaction.name || !transaction.category) return

    // UPDATE existing transaction
    if (editingTransaction) {
      const doUpdate = async () => {
        try {
          const { updateTransaction } = await import("@/lib/api/apis")
          const categoryId = Number(transaction.category)
          const payload = {
            name: transaction.name,
            amount: Math.abs(Number(transaction.amount)),
            description: transaction.description || null,
            categoryId: isNaN(categoryId) ? null : categoryId,
            issuedAt: transaction.date,
            budgetId: transaction.budgetId,
          }
          const updated = await updateTransaction(editingTransaction.id, payload)
          if (onCreate) onCreate(updated)
          const mapped = {
            id: String(updated.id ?? editingTransaction.id),
            amount: String(updated.amount),
            name: updated.name,
            description: updated.description ?? "",
            category:
              updated.category?.name ??
              categories.find((c) => String(c.id) === String(transaction.category))?.name ??
              "",
            date: updated.issuedAt,
          }
          onSubmit?.(mapped)
        } catch (err: any) {
          setError(err?.message || "Failed to update transaction")
          return
        } finally {
          resetAndClose()
        }
      }
      void doUpdate()
      return
    }

    // CREATE new transaction
    const doCreate = async () => {
      try {
        if (currentBudgetId) {
          const categoryId = Number(transaction.category)
          const payload = {
            name: transaction.name,
            amount: Math.abs(Number(transaction.amount)),
            description: transaction.description || null,
            categoryId: isNaN(categoryId) ? null : categoryId,
            issuedAt: transaction.date,
            budgetId: currentBudgetId,
          }
          const { createTransaction } = await import("@/lib/api/apis")
          const created = await createTransaction(payload)
          const mapped = {
            id: created.id ? String(created.id) : undefined,
            amount: String(created.amount ?? payload.amount),
            name: created.name ?? payload.name,
            description: created.description ?? payload.description ?? "",
            category:
              created.category?.name ??
              categories.find((c) => String(c.id) === String(transaction.category))?.name ??
              "",
            date: created.issuedAt ?? payload.issuedAt,
          }
          onSubmit?.(mapped)
          if (onCreate) onCreate(created)
        } else {
          onSubmit?.(transaction)
        }
      } catch (err: any) {
        setError(err?.message || "Failed to create transaction")
        return
      } finally {
        resetAndClose()
      }
    }
    void doCreate()
  }

  const resetAndClose = () => {
    setTransactionType(TransactionType.EXPENSE)
    setTransaction({
      amount: "",
      name: "",
      description: "",
      category: "",
      date: getBudgetDateRange().defaultDate,
      budgetId: "",
    })
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={transactionType === TransactionType.INCOME ? "text-green-700" : "text-red-700"}>
              {editingTransaction ? "Edit" : "Add"}{" "}
              {transactionType === TransactionType.INCOME ? "Income" : "Expense"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingTransaction ? "update" : "add"} a{" "}
              {transactionType === TransactionType.INCOME ? "income" : "expense"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type toggle — only shown when creating */}
            {!editingTransaction && (
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={transactionType === TransactionType.INCOME ? "default" : "outline"}
                    className={`flex-1 ${
                      transactionType === TransactionType.INCOME
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-green-600 border-green-600 hover:bg-green-50"
                    }`}
                    onClick={() => handleTypeChange(TransactionType.INCOME)}
                  >
                    Income
                  </Button>
                  <Button
                    type="button"
                    variant={transactionType === TransactionType.EXPENSE ? "default" : "outline"}
                    className={`flex-1 ${
                      transactionType === TransactionType.EXPENSE
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "text-red-600 border-red-600 hover:bg-red-50"
                    }`}
                    onClick={() => handleTypeChange(TransactionType.EXPENSE)}
                  >
                    Expense
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={transaction.amount}
                onChange={(e) => setTransaction((prev) => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name"
                value={transaction.name}
                onChange={(e) => setTransaction((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add more details..."
                value={transaction.description}
                onChange={(e) => setTransaction((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={transaction.category}
                onValueChange={(value) => {
                  if (value === "__create__") {
                    setCreateCategoryOpen(true)
                    return
                  }
                  setTransaction((prev) => ({ ...prev, category: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingCategories ? "Loading…" : "Select category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__create__" className="font-medium text-primary">
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      New Category
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={transaction.date}
                min={getBudgetDateRange().min}
                max={getBudgetDateRange().max}
                onChange={(e) => setTransaction((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {error && <div className="text-destructive text-sm">{error}</div>}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={resetAndClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className={`flex-1 ${
                  transactionType === TransactionType.INCOME
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
                disabled={isArchived || !transaction.amount || !transaction.name || !transaction.category}
              >
                {editingTransaction ? "Update" : "Add"}{" "}
                {transactionType === TransactionType.INCOME ? "Income" : "Expense"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline create-category dialog */}
      <Dialog open={createCategoryOpen} onOpenChange={(open) => { if (!open) closeCreateCategory() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription>
              This category will be available for all future transactions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Name</Label>
              <Input
                id="new-category-name"
                placeholder="e.g. Groceries"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory() }}
                autoFocus
              />
            </div>

            {createCategoryError && (
              <div className="text-destructive text-sm">{createCategoryError}</div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={closeCreateCategory} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={createCategorySubmitting || !newCategoryName.trim()}
                className="flex-1"
              >
                {createCategorySubmitting ? "Creating…" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
