"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileText } from "lucide-react"
import type { Transaction } from "@/types/transaction"

interface TransactionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            View the details of this {transaction.type} transaction below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {transaction.description ? (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm leading-relaxed text-foreground">{transaction.description}</p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
              <p className="text-sm text-muted-foreground italic text-center">
                No additional details provided for this transaction.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}