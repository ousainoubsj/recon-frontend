'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DANGER_BUTTON, DIALOG_CONTENT, INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from './classes'

type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
  isPending: boolean
  isDestructive: boolean
  // When set, the confirm button stays disabled until this exact word is typed (irreversible actions).
  confirmPhrase?: string
  onConfirm: () => void
}

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  isDestructive,
  confirmPhrase,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [typed, setTyped] = useState('')
  const isPhraseMissing = !!confirmPhrase && typed !== confirmPhrase

  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">{title}</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">{description}</DialogDescription>
        </DialogHeader>
        {confirmPhrase && (
          <label className="block text-sm text-slate-300">
            Type <span className="font-mono font-bold text-rose-300">{confirmPhrase}</span> to confirm
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className={`${INPUT} mt-1.5`} />
          </label>
        )}
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className={OUTLINE_BUTTON}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending || isPhraseMissing}
            className={isDestructive ? DANGER_BUTTON : PRIMARY_BUTTON}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
