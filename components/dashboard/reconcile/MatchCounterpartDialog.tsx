'use client'

import { useState } from 'react'
import { Link2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useResolveRows } from '@/lib/hooks/useReports'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { toast } from '@/lib/toast'
import type { TransactionListItem } from '@/types/reports'
import CounterpartPicker, { amountOnSide } from './CounterpartPicker'
import ResolutionNoteField from './ResolutionNoteField'

// Amounts arrive as JSON numbers; the difference is taken in 4-dp minor units (the column's scale) so it can't drift.
const AMOUNT_SCALE = 10_000

type MatchCounterpartDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  row: { id: string; reference: string; side: 'A' | 'B'; amount: number | null }
}

export default function MatchCounterpartDialog({ open, onOpenChange, reportId, row }: MatchCounterpartDialogProps) {
  const { formatCurrency } = useOrgFormat()
  const resolveRows = useResolveRows()
  const [search, setSearch] = useState('')
  const [counterpart, setCounterpart] = useState<TransactionListItem | null>(null)
  const [note, setNote] = useState('')

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearch('')
      setCounterpart(null)
      setNote('')
    }
  }

  const otherSide = row.side === 'A' ? 'B' : 'A'
  const counterpartAmount = counterpart ? amountOnSide(counterpart, otherSide) : null
  const difference =
    row.amount != null && counterpartAmount != null
      ? (Math.round(row.amount * AMOUNT_SCALE) - Math.round(counterpartAmount * AMOUNT_SCALE)) / AMOUNT_SCALE
      : null

  const title = `Match ${row.reference}`
  const description = `Pick the ${otherSide === 'A' ? 'internal' : 'counterparty'} transaction it corresponds to. Both stay as reconciled; the match is recorded alongside.`

  const handleSubmit = () => {
    if (!counterpart) return
    resolveRows.mutate(
      { id: reportId, input: { kind: 'matched', rowIds: [row.id, counterpart.id], note: note.trim() } },
      {
        onSuccess: () => {
          toast.success('Transactions matched')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-cols-1 border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-400/15">
            <Link2 className="h-6 w-6 text-teal-400" />
          </div>
          <div className="min-w-0 flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">
              <TruncateTooltip as="span" className="block truncate" tooltip={title}>
                {title}
              </TruncateTooltip>
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              <TruncateTooltip as="span" className="block truncate" tooltip={description}>
                {description}
              </TruncateTooltip>
            </DialogDescription>
          </div>
        </DialogHeader>

        <CounterpartPicker
          reportId={reportId}
          side={otherSide}
          search={search}
          onSearchChange={setSearch}
          selectedId={counterpart?.id}
          onSelect={setCounterpart}
        />

        {counterpart && (
          <div className="grid grid-cols-3 rounded-lg border border-[#232D47] px-3 py-2 text-sm">
            <span className="text-slate-400">This: {row.amount != null ? formatCurrency(row.amount) : '—'}</span>
            <span className="text-center text-slate-400">Picked: {counterpartAmount != null ? formatCurrency(counterpartAmount) : '—'}</span>
            <span className={difference ? 'text-right text-amber-400' : 'text-right text-emerald-400'}>
              Difference: {difference != null ? formatCurrency(difference) : '—'}
            </span>
          </div>
        )}

        <ResolutionNoteField value={note} onChange={setNote} placeholder="e.g. Same payment, the bank truncated the reference" />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={resolveRows.isPending || !counterpart || !note.trim()}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-1 bg-teal-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resolveRows.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {resolveRows.isPending ? 'Matching transactions...' : 'Match transactions'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
