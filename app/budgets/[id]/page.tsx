"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { TransactionType, type Transaction } from "@/types/transaction"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SummaryCard } from "@/components/summary-card"
import { MonthYearSelect } from "@/components/month-year-select"
import { TransactionModal } from "@/components/transactions/transaction-modal"
import { TransactionDetailsModal } from "@/components/transactions/transaction-details-modal"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/currency"
import { useRequireAuth } from "@/hooks/use-require-auth"
import { useBudgets } from "@/hooks/use-budgets"
import { useBudgetTransactions } from "@/hooks/use-budget-transactions"
import { useCreateCategory } from "@/hooks/use-create-category"
import { useCreateBudget } from "@/hooks/use-create-budget"
import {
  Archive,
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react"

export default function BudgetDetailPage() {
  useRequireAuth()

  const params = useParams<{ id: string }>()
  const budgetId = params.id

  const {
    budgets,
    budgetsError,
    currentBudget,
    selectBudget,
    refreshBudget,
    deleteTransaction,
    createBudget,
  } = useBudgets(budgetId)

  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [editingTransactionData, setEditingTransactionData] = useState<Transaction | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionPendingDelete, setTransactionPendingDelete] = useState<Transaction | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    filter: transactionFilter,
    setFilter: setTransactionFilter,
    loading: transactionsLoading,
    error: transactionsError,
    expandedGroups,
    toggleGroup: toggleGroupExpansion,
    groups: groupedTransactions,
    refetch: refetchTransactions,
  } = useBudgetTransactions(budgetId)

  const createCategory = useCreateCategory()
  const createBudgetForm = useCreateBudget({ onSubmit: createBudget })

  // Use totals returned by backend (do not recompute on frontend)
  const totalIncome = currentBudget?.totalIncome ?? 0
  const totalExpenses = currentBudget?.totalExpense ?? 0
  const netBalance = currentBudget?.netBalance ?? (totalIncome - totalExpenses)
  const startEditTransaction = (transaction: Transaction) => {
    setEditingTransactionData(transaction)
    if (transaction.type === TransactionType.INCOME) {
      setIncomeModalOpen(true)
    } else {
      setExpenseModalOpen(true)
    }
  }

  const handleIncomeModalClose = () => {
    setIncomeModalOpen(false)
    setEditingTransactionData(null)
  }

  const handleExpenseModalClose = () => {
    setExpenseModalOpen(false)
    setEditingTransactionData(null)
  }

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailsModalOpen(true)
  }

  const handleTransactionSaved = () => {
    refreshBudget(budgetId)
    refetchTransactions()
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    setDeleteError(null)
    try {
      await deleteTransaction(transactionId)
      refetchTransactions()
    } catch (err: any) {
      setDeleteError(err?.message || "Failed to delete transaction")
    } finally {
      setTransactionPendingDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {budgetsError && <div className="text-destructive text-sm">{budgetsError}</div>}
        {transactionsError && <div className="text-destructive text-sm">{transactionsError}</div>}
        {deleteError && <div className="text-destructive text-sm">{deleteError}</div>}

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/budgets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Budgets
            </Button>
          </Link>

          <div className="flex flex-wrap gap-2">
            <Select value={budgetId} onValueChange={selectBudget}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                {budgets
                  .filter((s) => !s.isArchived)
                  .map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      {budget.name}
                    </SelectItem>
                  ))}
                {budgets.some((s) => s.isArchived) && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Archived</div>
                    {budgets
                      .filter((s) => s.isArchived)
                      .map((budget) => (
                        <SelectItem key={budget.id} value={budget.id}>
                          <div className="flex items-center gap-2">
                            <Archive className="h-3 w-3" />
                            {budget.name}
                          </div>
                        </SelectItem>
                      ))}
                  </>
                )}
              </SelectContent>
            </Select>

            <Button onClick={() => createBudgetForm.setOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Budget
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800"
            textColors="text-green-800 dark:text-green-200"
            iconColor="text-green-600 dark:text-green-400"
          />

          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800"
            textColors="text-red-800 dark:text-red-200"
            iconColor="text-red-600 dark:text-red-400"
          />

          <SummaryCard
            title="Net Balance"
            value={formatCurrency(netBalance)}
            icon={DollarSign}
            gradient={`bg-gradient-to-br ${
              netBalance >= 0
                ? "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800"
                : "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
            }`}
            textColors={netBalance >= 0 ? "text-blue-800 dark:text-blue-200" : "text-orange-800 dark:text-orange-200"}
            iconColor={netBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}
          />

        </div>

        {/* Main Content */}
        {currentBudget && (
          <div className="grid gap-6">
            {/* Transaction List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => setIncomeModalOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={currentBudget?.isArchived}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Income
                    </Button>
                    <Button
                      onClick={() => setExpenseModalOpen(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={currentBudget?.isArchived}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Expense
                    </Button>
                    <Button
                      onClick={() => createCategory.setOpen(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Category
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {currentBudget.isArchived && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Archived
                      </Badge>
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {Object.values(groupedTransactions).reduce((sum, g) => sum + g.transactions.length, 0)} transactions
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={transactionFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTransactionFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={transactionFilter === TransactionType.INCOME ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTransactionFilter(TransactionType.INCOME)}
                    className={
                      transactionFilter === TransactionType.INCOME
                        ? "bg-green-600 hover:bg-green-700"
                        : "text-green-600 border-green-600 hover:bg-green-50"
                    }
                  >
                    Income
                  </Button>
                  <Button
                    variant={transactionFilter === TransactionType.EXPENSE ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTransactionFilter(TransactionType.EXPENSE)}
                    className={
                      transactionFilter === TransactionType.EXPENSE
                        ? "bg-red-600 hover:bg-red-700"
                        : "text-red-600 border-red-600 hover:bg-red-50"
                    }
                  >
                    Expenses
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading transactions…</div>
                ) : Object.keys(groupedTransactions).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet. Add your first transaction to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(groupedTransactions).map(([groupKey, group]) => {
                      const isExpanded = expandedGroups.has(groupKey)

                      return (
                        <div key={groupKey} className="space-y-2">
                          {/* Group Header */}
                          <div
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                              group.type === TransactionType.INCOME
                                ? "bg-green-50 border-green-200 dark:bg-green-950/10 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/20"
                                : "bg-red-50 border-red-200 dark:bg-red-950/10 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/20"
                            }`}
                            onClick={() => toggleGroupExpansion(groupKey)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{group.label}</span>
                              <Badge variant="outline" className="text-xs">
                                {group.transactions.length} transaction{group.transactions.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  group.type === TransactionType.INCOME
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {group.type === TransactionType.INCOME ? "+" : "-"}
                                {formatCurrency(group.total)}
                              </span>
                              <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                                <TrendingDown className="h-4 w-4" />
                              </div>
                            </div>
                          </div>

                          {/* Expanded Transactions */}
                          {isExpanded && (
                            <div className="ml-4 space-y-2">
                              {group.transactions.map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer ${
                                    transaction.type === TransactionType.INCOME
                                      ? "bg-green-25 border-green-100 dark:bg-green-950/5 dark:border-green-900"
                                      : "bg-red-25 border-red-100 dark:bg-red-950/5 dark:border-red-900"
                                  }`}
                                  onClick={() => showTransactionDetails(transaction)}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{transaction.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-sm font-medium ${
                                        transaction.type === TransactionType.INCOME
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {transaction.type === TransactionType.INCOME ? "+" : "-"}
                                      {formatCurrency(transaction.amount)}
                                    </span>
                                    {!currentBudget.isArchived && (
                                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => startEditTransaction(transaction)}
                                          className="h-6 w-6 p-0 text-muted-foreground hover:text-blue-600"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setTransactionPendingDelete(transaction)}
                                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <TransactionModal
          isOpen={incomeModalOpen}
          onClose={handleIncomeModalClose}
          type={TransactionType.INCOME}
          isArchived={currentBudget?.isArchived}
          currentBudgetId={budgetId}
          budgetMonth={currentBudget?.month}
          budgetYear={currentBudget?.year}
          onCreate={handleTransactionSaved}
          editingTransaction={editingTransactionData}
        />

        <TransactionModal
          isOpen={expenseModalOpen}
          onClose={handleExpenseModalClose}
          type={TransactionType.EXPENSE}
          isArchived={currentBudget?.isArchived}
          currentBudgetId={budgetId}
          budgetMonth={currentBudget?.month}
          budgetYear={currentBudget?.year}
          onCreate={handleTransactionSaved}
          editingTransaction={editingTransactionData}
        />

        <TransactionDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          transaction={selectedTransaction}
        />

        {/* Delete Transaction Confirmation */}
        <DeleteConfirmationDialog
          open={!!transactionPendingDelete}
          title="Delete transaction?"
          description={transactionPendingDelete ? `This will permanently delete "${transactionPendingDelete.name}". This cannot be undone.` : undefined}
          onConfirm={() => transactionPendingDelete && handleDeleteTransaction(transactionPendingDelete.id)}
          onCancel={() => setTransactionPendingDelete(null)}
        />

        {/* Create Budget Dialog */}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createBudgetForm.submitting}
                >
                  {createBudgetForm.submitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog open={createCategory.open} onOpenChange={(open) => { if (!open) createCategory.close() }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>Add a new income or expense category to use when adding transactions.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-type">Type</Label>
                <Select value={createCategory.type} onValueChange={(v) => createCategory.setType(v as "INCOME" | "EXPENSE")}>
                  <SelectTrigger id="category-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={createCategory.name}
                  onChange={(e) => createCategory.setName(e.target.value)}
                  placeholder="e.g. Groceries"
                />
              </div>

              {createCategory.error && <div className="text-destructive text-sm">{createCategory.error}</div>}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={createCategory.close} className="flex-1">Cancel</Button>
                <Button
                  onClick={createCategory.submit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createCategory.submitting}
                >
                  {createCategory.submitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
