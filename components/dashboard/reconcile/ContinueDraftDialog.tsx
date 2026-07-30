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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useDrafts } from '@/lib/hooks/useReports'
import { formatTimeAgo } from '@/lib/format'
import { EmptyNeutralState } from './EmptyStates'
import type { Report } from '@/types/reports'

type ContinueDraftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResume?: (draft: Report) => void
}

export default function ContinueDraftDialog({ open, onOpenChange, onResume }: ContinueDraftDialogProps) {
  const { data: drafts, isLoading } = useDrafts()

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

        <ScrollArea className="max-h-96">
          <div className="space-y-2 pr-3">
            {isLoading || !drafts ? (
              [0, 1].map((i) => (
                <div key={i} className="rounded-xl border border-[#232D47] bg-[#111C3D]/60 p-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-32" />
                  <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
                </div>
              ))
            ) : drafts.length === 0 ? (
              <EmptyNeutralState title="No unfinished reconciliations" subtitle="Drafts you haven't finished will show up here." />
            ) : (
              drafts.map((draft) => (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => onResume?.(draft)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#232D47] bg-[#111C3D]/60 p-3 text-left transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <TruncateTooltip as="p" className="truncate text-sm font-medium text-white" tooltip={draft.name ?? 'Untitled Reconciliation'}>
                      {draft.name ?? 'Untitled Reconciliation'}
                    </TruncateTooltip>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Updated {formatTimeAgo(draft.updatedAt)} · {draft.progress}% complete
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500"
                        style={{ width: `${draft.progress}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
