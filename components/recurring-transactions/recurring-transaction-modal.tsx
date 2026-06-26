"use client"

import { useEffect, useState } from "react"
import type { RecurringTransactionDto } from "@/types/recurring-transaction"
import { useCategories } from "@/hooks/use-categories"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface RecurringTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  editingItem?: RecurringTransactionDto | null
  onSaved?: (saved: RecurringTransactionDto) => void
}

const emptyForm = {
  name: "",
  amount: "",
  description: "",
  categoryId: "",
  active: true,
}

export function RecurringTransactionModal({
  isOpen,
  onClose,
  editingItem = null,
  onSaved,
}: RecurringTransactionModalProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [form, setForm] = useState(emptyForm)
  const { categories, loadingCategories, error: categoriesError } = useCategories(type, isOpen)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing template into the form, or reset for a new one.
  useEffect(() => {
    if (editingItem) {
      setType(editingItem.categoryType)
      setForm({
        name: editingItem.name,
        amount: String(editingItem.amount),
        description: editingItem.description ?? "",
        categoryId: String(editingItem.categoryId),
        active: editingItem.active,
      })
    } else {
      setType("EXPENSE")
      setForm(emptyForm)
    }
  }, [editingItem, isOpen])

  const handleTypeChange = (value: "INCOME" | "EXPENSE") => {
    setType(value)
    setForm((prev) => ({ ...prev, categoryId: "" }))
  }

  const resetAndClose = () => {
    setType("EXPENSE")
    setForm(emptyForm)
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.categoryId) return

    setError(null)
    setSubmitting(true)

    try {
      const { createRecurringTransaction, updateRecurringTransaction } = await import("@/lib/api/apis")

      const payload = {
        name: form.name,
        amount: Math.abs(Number(form.amount)),
        description: form.description || undefined,
        categoryId: Number(form.categoryId),
      }

      const saved = editingItem
        ? await updateRecurringTransaction(editingItem.id, { ...payload, active: form.active })
        : await createRecurringTransaction(payload)

      onSaved?.(saved)
      resetAndClose()
    } catch (err: any) {
      setError(err?.message || `Failed to ${editingItem ? "update" : "create"} recurring transaction`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Edit" : "New"} Recurring Transaction</DialogTitle>
          <DialogDescription>
            {editingItem
              ? "Update this recurring transaction template."
              : "Create a template for a transaction that repeats, like rent or a subscription."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rt-type">Type</Label>
            <Select value={type} onValueChange={(value) => handleTypeChange(value as "INCOME" | "EXPENSE")}>
              <SelectTrigger id="rt-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rt-name">Name</Label>
            <Input
              id="rt-name"
              placeholder="e.g. Rent"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rt-amount">Amount</Label>
            <Input
              id="rt-amount"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rt-description">Description (Optional)</Label>
            <Textarea
              id="rt-description"
              placeholder="Add more details..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rt-category">Category</Label>
            <Select
              value={form.categoryId}
              onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger id="rt-category">
                <SelectValue placeholder={loadingCategories ? "Loading categories…" : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingItem && (
            <div className="space-y-2">
              <Label htmlFor="rt-active">Status</Label>
              <Select
                value={form.active ? "active" : "inactive"}
                onValueChange={(value) => setForm((prev) => ({ ...prev, active: value === "active" }))}
              >
                <SelectTrigger id="rt-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(error || categoriesError) && (
            <div className="text-destructive text-sm">{error || categoriesError}</div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetAndClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={submitting || !form.name || !form.amount || !form.categoryId}
            >
              {submitting ? (editingItem ? "Saving..." : "Creating...") : editingItem ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
