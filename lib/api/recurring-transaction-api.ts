import { fetchWithAuth } from "./auth-api"
import { extractErrorMessage, extractArrayData, extractData } from "./utils"
import type { CreateRecurringTransactionRequest, UpdateRecurringTransactionRequest } from "@/types/recurring-transaction"

export async function fetchRecurringTransactions(type?: "INCOME" | "EXPENSE") {
  const url = type
    ? `/recurring-transactions/user?type=${type}`
    : "/recurring-transactions/user"
  const res = await fetchWithAuth(url, { method: "GET" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to fetch recurring transactions"))
  return extractArrayData(json)
}

export async function createRecurringTransaction(payload: CreateRecurringTransactionRequest) {
  const res = await fetchWithAuth("/recurring-transactions/recurring-transaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to create recurring transaction"))
  return extractData(json)
}

export async function updateRecurringTransaction(id: string | number, payload: UpdateRecurringTransactionRequest) {
  const res = await fetchWithAuth(`/recurring-transactions/recurring-transaction/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to update recurring transaction"))
  return extractData(json)
}

export async function setRecurringTransactionActive(id: string | number, active: boolean) {
  const res = await fetchWithAuth(`/recurring-transactions/recurring-transaction/${id}/activation`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to update status"))
  return extractData(json)
}

export async function deleteRecurringTransaction(id: string | number) {
  const res = await fetchWithAuth(`/recurring-transactions/recurring-transaction/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(extractErrorMessage(json, "Failed to delete recurring transaction"))
  }
}
