"use client"

import { useState } from "react"

interface UseCreateBudgetOptions {
  onSubmit: (payload: { month: number; year: number }) => Promise<unknown>
}

// Owns the "Create Budget" dialog's month/year form state and submission.
export function useCreateBudget({ onSubmit }: UseCreateBudgetOptions) {
  const now = new Date()
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setOpen(false)
    setError(null)
  }

  const submit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ month, year })
      setOpen(false)
    } catch (err: any) {
      setError(err?.message || "Failed to create budget")
    } finally {
      setSubmitting(false)
    }
  }

  return { open, setOpen, month, setMonth, year, setYear, submitting, error, close, submit }
}
