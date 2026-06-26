import { fetchWithAuth } from "./auth-api"
import { extractErrorMessage, extractData } from "./utils"

export async function fetchCategories(type: "INCOME" | "EXPENSE") {
  const res = await fetchWithAuth(`/categories/${type}`, { method: "GET" })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to fetch categories"))
  if (json && typeof json === "object" && "data" in json) {
    return Array.isArray(json.data) ? json.data : []
  }
  if (Array.isArray(json)) return json
  return []
}

export async function createCategory(payload: { name: string; type: "INCOME" | "EXPENSE" }) {
  const res = await fetchWithAuth(`/categories/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(extractErrorMessage(json, "Failed to create category"))
  return extractData(json)
}
