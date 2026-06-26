import { fetchWithAuth } from "./auth-api"
import { extractErrorMessage, extractArrayData, extractData } from "./utils"

// Omit `type` to fetch all transactions for the budget regardless of category type.
export async function fetchTransactionsByBudget(budgetId: string | number, type?: "INCOME" | "EXPENSE") {
  const query = type ? `?type=${encodeURIComponent(type)}` : ""
  const res = await fetchWithAuth(`/transactions/budgets/${encodeURIComponent(String(budgetId))}${query}`, {
    method: "GET",
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to fetch transactions"))
  return extractArrayData(json)
}

// New: budgetId should be included inside the request body as `budgetId`.
export async function createTransaction(body: any) {
  const res = await fetchWithAuth(`/transactions/transaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to create transaction"))
  return extractData(json)
}

export async function deleteTransaction(txId: string | number) {
  const res = await fetchWithAuth(`/transactions/transaction/${txId}`, { method: "DELETE" })
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(extractErrorMessage(json, "Failed to delete transaction"))
  }
}

export async function updateTransaction(txId: string | number, body: any) {
  const res = await fetchWithAuth(`/transactions/transaction/${txId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to update transaction"))
  return extractData(json)
}
