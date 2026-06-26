"use client"

import { useState } from "react"
import { createCategory } from "@/lib/api/apis"

// Owns the "Create Category" dialog's form state and submission to the backend.
export function useCreateCategory() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setOpen(false)
    setError(null)
  }

  const submit = async () => {
    setError(null)
    if (!name || !type) {
      setError("Name and type are required")
      return
    }

    setSubmitting(true)
    try {
      await createCategory({ name: name.trim(), type })
      setName("")
      setType("EXPENSE")
      setOpen(false)
    } catch (err: any) {
      setError(err?.message || "Failed to create category")
    } finally {
      setSubmitting(false)
    }
  }

  return { open, setOpen, name, setName, type, setType, submitting, error, close, submit }
}
