'use client'

import { useState } from 'react'
import { Link2, Loader2, MessageSquareText, Undo2 } from 'lucide-react'
import { useCanEditReports, useUnresolve } from '@/lib/hooks/useReports'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { toast } from '@/lib/toast'
import type { TransactionDetail } from '@/types/reports'
import { amountOnSide } from './CounterpartPicker'
import ExplainBreakDialog from './ExplainBreakDialog'
import MatchCounterpartDialog from './MatchCounterpartDialog'
import ResolutionBadge from './ResolutionBadge'

type ResolutionPanelProps = {
  reportId: string
  detail: TransactionDetail
  onSelectRow?: (rowId: string) => void
}

export default function ResolutionPanel({ reportId, detail, onSelectRow }: ResolutionPanelProps) {
  const { formatDateTime } = useOrgFormat()
  const canEdit = useCanEditReports()
  const unresolve = useUnresolve()
  const [openDialog, setOpenDialog] = useState<'match' | 'explain' | null>(null)

  const { resolution } = detail

  if (resolution) {
    const pairedRows = resolution.rows.filter((row) => row.id !== detail.id)
    return (
      <div className="mt-4 space-y-2 rounded-xl border border-[#232D47] p-4">
        <div className="flex items-center justify-between gap-2">
          <ResolutionBadge kind={resolution.kind} />
          {canEdit && (
            <button
              type="button"
              onClick={() =>
                unresolve.mutate({ id: reportId, resolutionId: resolution.id }, { onSuccess: () => toast.success('Resolution undone') })
              }
              disabled={unresolve.isPending}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {unresolve.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
              Undo
            </button>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap text-slate-200">{resolution.note}</p>
        {pairedRows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelectRow?.(row.id)}
            className="cursor-pointer text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            Paired with {row.reference || 'a transaction with no reference'}
          </button>
        ))}
        <p className="text-xs text-slate-500">
          {resolution.resolvedBy?.name ?? 'A former member'} · {formatDateTime(resolution.resolvedAt)}
        </p>
      </div>
    )
  }

  if (detail.status === 'Matched' || !canEdit) return null

  const isUnmatched = detail.status === 'Unmatched'
  // The explorer shows both unmatched sides as "Unmatched"; only a counterparty-only row has no ledger data.
  const side = isUnmatched && detail.rawA == null ? 'B' : 'A'

  return (
    <div className="mt-4 flex gap-2">
      {isUnmatched && (
        <button
          type="button"
          onClick={() => setOpenDialog('match')}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-teal-500/60 py-2.5 text-sm font-medium text-teal-300 transition-all hover:bg-teal-500/10 active:scale-95"
        >
          <Link2 className="h-4 w-4" />
          Match with…
        </button>
      )}
      <button
        type="button"
        onClick={() => setOpenDialog('explain')}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-sky-500/60 py-2.5 text-sm font-medium text-sky-300 transition-all hover:bg-sky-500/10 active:scale-95"
      >
        <MessageSquareText className="h-4 w-4" />
        Explain
      </button>

      {isUnmatched && (
        <MatchCounterpartDialog
          open={openDialog === 'match'}
          onOpenChange={(open) => setOpenDialog(open ? 'match' : null)}
          reportId={reportId}
          row={{ id: detail.id, reference: detail.reference, side, amount: amountOnSide(detail, side) }}
        />
      )}
      <ExplainBreakDialog
        open={openDialog === 'explain'}
        onOpenChange={(open) => setOpenDialog(open ? 'explain' : null)}
        reportId={reportId}
        rowId={detail.id}
        reference={detail.reference}
      />
    </div>
  )
}
