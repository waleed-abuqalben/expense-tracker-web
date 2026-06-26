export enum BudgetStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface CategoryDto {
  id: number
  name: string
  // backend returns "INCOME" or "EXPENSE"
  type: "INCOME" | "EXPENSE"
  userId: number
}

export interface TransactionDto {
  id: number
  name: string
  amount: number
  description?: string | null
  // backend returns category as flat fields on the transaction, not a nested object
  categoryType?: "INCOME" | "EXPENSE" | null
  categoryName?: string | null
  issuedAt: string // ISO date string
}

export interface Budget {
  id: number
  year: number
  month: number
  status: "ACTIVE" | "ARCHIVED"
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactions: TransactionDto[]
  userId: number
}