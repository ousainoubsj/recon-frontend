'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Draft = {
  id: string
  name: string
  updatedAt: string
  progress: number
}

const drafts: Draft[] = [
  { id: 'q3-vendor', name: 'Q3 Vendor Reconciliation', updatedAt: 'Updated 2 hours ago', progress: 65 },
  { id: 'april-payroll', name: 'April Payroll Match', updatedAt: 'Updated yesterday', progress: 30 },
]

type ContinueDraftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResume?: (draft: Draft) => void
}

export default function ContinueDraftDialog({ open, onOpenChange, onResume }: ContinueDraftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-4 text-white sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-400/15">
            <Image src="/icons/draft.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Continue Draft</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Resume an unfinished reconciliation.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          {drafts.map((draft) => (
            <button
              key={draft.id}
              type="button"
              onClick={() => onResume?.(draft)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#232D47] bg-[#111C3D]/60 p-3 text-left transition-colors hover:bg-white/5"
            >
              <div className="min-w-0 flex-1">
                <TruncateTooltip as="p" className="truncate text-sm font-medium text-white" tooltip={draft.name}>
                  {draft.name}
                </TruncateTooltip>
                <p className="mt-0.5 text-xs text-slate-400">{draft.updatedAt} · {draft.progress}% complete</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500"
                    style={{ width: `${draft.progress}%` }}
                  />
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
