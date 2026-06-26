"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useRecurringTransactions } from "@/hooks/use-recurring-transactions"
import { RecurringTransactionModal } from "@/components/recurring-transactions/recurring-transaction-modal"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import type { RecurringTransactionDto } from "@/types/recurring-transaction"
import { formatCurrency } from "@/lib/currency"
import { Plus, Edit, Trash2, Repeat, ChevronDown } from "lucide-react"

export default function RecurringTransactionsPage() {
  useRequireAuth()

  const {
    filter,
    setFilter,
    items,
    loading,
    error,
    reload,
    toggleActive,
    remove,
    groups,
    expandedGroups,
    toggleGroup,
  } = useRecurringTransactions()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringTransactionDto | null>(null)
  const [pendingDelete, setPendingDelete] = useState<RecurringTransactionDto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const groupEntries = Object.entries(groups)

  const openCreate = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const openEdit = (item: RecurringTransactionDto) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleToggleActive = async (item: RecurringTransactionDto, active: boolean) => {
    setActionError(null)
    try {
      await toggleActive(item.id, active)
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status")
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    setActionError(null)
    try {
      await remove(pendingDelete.id)
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete recurring transaction")
    } finally {
      setPendingDelete(null)
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Recurring Transaction
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "INCOME" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("INCOME")}
          className={
            filter === "INCOME"
              ? "bg-green-600 hover:bg-green-700"
              : "text-green-600 border-green-600 hover:bg-green-50"
          }
        >
          Income
        </Button>
        <Button
          variant={filter === "EXPENSE" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("EXPENSE")}
          className={
            filter === "EXPENSE"
              ? "bg-red-600 hover:bg-red-700"
              : "text-red-600 border-red-600 hover:bg-red-50"
          }
        >
          Expense
        </Button>
      </div>

      {actionError && <div className="text-destructive text-sm mb-4">{actionError}</div>}

      {loading ? (
        <div>Loading recurring transactions…</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No recurring transactions yet. Add your first template to get started!</p>
        </div>
      ) : groupEntries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Repeat className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {filter === "INCOME" ? "income" : "expense"} recurring transactions found.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            {groupEntries.map(([groupKey, group]) => {
              const isExpanded = expandedGroups.has(groupKey)

              return (
                <div key={groupKey} className="space-y-2">
                  {/* Group Header */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      group.categoryType === "INCOME"
                        ? "bg-green-50 border-green-200 dark:bg-green-950/10 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/20"
                        : "bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/20"
                    }`}
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{group.categoryName}</span>
                      <Badge variant="outline" className="text-xs">
                        {group.items.length} template{group.items.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          group.categoryType === "INCOME"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {group.categoryType === "INCOME" ? "+" : "-"}
                        {formatCurrency(group.total)}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded Templates */}
                  {isExpanded && (
                    <div className="ml-4 space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-md border ${
                            item.categoryType === "INCOME"
                              ? "bg-green-25 border-green-100 dark:bg-green-950/5 dark:border-green-900"
                              : "bg-red-25 border-red-100 dark:bg-red-950/5 dark:border-red-900"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.name}</span>
                              {!item.active && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="mt-1 truncate text-xs text-muted-foreground">{item.description}</p>
                            )}
                          </div>

                          <span
                            className={`text-sm font-medium ${
                              item.categoryType === "INCOME"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {item.categoryType === "INCOME" ? "+" : "-"}
                            {formatCurrency(item.amount)}
                          </span>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.active}
                              onCheckedChange={(checked) => handleToggleActive(item, checked)}
                              aria-label={item.active ? "Deactivate" : "Activate"}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(item)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPendingDelete(item)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <RecurringTransactionModal isOpen={modalOpen} onClose={closeModal} editingItem={editingItem} onSaved={reload} />

      <DeleteConfirmationDialog
        open={!!pendingDelete}
        title="Delete recurring transaction?"
        description={pendingDelete ? `This will permanently delete "${pendingDelete.name}". This cannot be undone.` : undefined}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  )
}
