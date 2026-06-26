import type { Budget as ApiBudget, TransactionDto as ApiTransactionDto } from "@/types/budget"
import { TransactionType, type Transaction } from "@/types/transaction"

export interface UiBudget {
  id: string
  name: string
  month: number
  year: number
  transactions: Transaction[]
  isArchived: boolean
  createdAt: string
  totalIncome?: number
  totalExpense?: number
  netBalance?: number
}

export function mapApiTransaction(t: ApiTransactionDto): Transaction {
  const raw = Number(t.amount ?? 0)
  const amount = Number.isFinite(raw) ? Math.round(raw * 100) / 100 : 0
  const categoryName = t.categoryName ?? ""
  const type = t.categoryType === "EXPENSE" ? TransactionType.EXPENSE : TransactionType.INCOME

  return {
    id: String(t.id ?? Date.now()),
    // store positive magnitude; use `type` to decide sign/display
    amount: Math.abs(amount),
    name: t.name ?? "",
    description: t.description ?? "",
    category: categoryName,
    date: t.issuedAt ?? new Date().toISOString().split("T")[0],
    type,
  }
}

export function mapApiBudget(b: ApiBudget): UiBudget {
  const monthIndex = Math.max(0, (b.month ?? 1) - 1)
  const monthName = new Date(b.year ?? 1970, monthIndex).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return {
    id: String(b.id),
    name: monthName,
    month: b.month ?? 1,
    year: b.year ?? new Date().getFullYear(),
    transactions: Array.isArray(b.transactions) ? b.transactions.map(mapApiTransaction) : [],
    isArchived: (b.status ?? "ACTIVE") === "ARCHIVED",
    createdAt: new Date(b.year ?? 1970, monthIndex, 1).toISOString(),
    // include backend totals — frontend should not recompute these
    totalIncome: Number.isFinite(b.totalIncome ?? NaN) ? b.totalIncome : 0,
    totalExpense: Number.isFinite(b.totalExpense ?? NaN) ? b.totalExpense : 0,
    netBalance: Number.isFinite(b.netBalance ?? NaN) ? b.netBalance : 0,
  }
}
