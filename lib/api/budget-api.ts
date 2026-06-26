import { fetchWithAuth } from "./auth-api"
import { extractErrorMessage, extractArrayData, extractData } from "./utils"

export async function fetchBudgets() {
  const res = await fetchWithAuth("/budgets", { method: "GET" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to fetch budgets"))
  return extractArrayData(json)
}

export async function createBudget(payload: { month: number; year: number }) {
  const res = await fetchWithAuth("/budgets/budget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to create budget"))
  return extractData(json)
}

export async function fetchBudget(budgetId: string | number) {
  const res = await fetchWithAuth(`/budgets/budget/${encodeURIComponent(String(budgetId))}`, { method: "GET" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to fetch budget"))
  return extractData(json)
}
