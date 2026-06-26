export interface RecurringTransactionDto {
  id: number
  name: string
  amount: number
  description: string | null
  active: boolean
  categoryId: number
  categoryName: string
  categoryType: "INCOME" | "EXPENSE"
}

export interface CreateRecurringTransactionRequest {
  name: string
  amount: number
  description?: string
  categoryId: number
}

export interface UpdateRecurringTransactionRequest extends CreateRecurringTransactionRequest {
  active: boolean
}
