export function extractErrorMessage(json: any, fallback: string): string {
  return json?.message || json?.error || fallback
}

export function extractArrayData(json: any): any[] {
  if (json && typeof json === "object" && Array.isArray((json as any).data)) {
    return (json as any).data
  }
  if (Array.isArray(json)) return json
  return []
}

export function extractData(json: any): any {
  if (json && typeof json === "object" && "data" in json) return json.data
  return json
}
