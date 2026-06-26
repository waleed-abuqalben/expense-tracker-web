export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface Transaction {
  id: string
  amount: number
  name: string
  description: string
  category: string
  date: string
  type: TransactionType
}