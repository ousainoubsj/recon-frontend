'use client'

import { useState } from 'react'
import { Loader2, PencilLine } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/money-input'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { ApiError } from '@/lib/axios'
import { sourceCellValue } from '@/lib/corrections'
import { useCreateCorrection } from '@/lib/hooks/useReports'
import { toast } from '@/lib/toast'
import type { CorrectionField, CorrectionSide, TransactionDetail } from '@/types/reports'
import type { ColumnMapping } from '@/types/wizard'
import CorrectionTargetFields from './CorrectionTargetFields'
import ResolutionNoteField from './ResolutionNoteField'

// Matches corrected_value's VarChar(500) on report_corrections.
const CORRECTED_VALUE_MAX_LENGTH = 500
const DESCRIPTION = 'The uploaded file stays unchanged; the next rerun uses this value instead.'

const INPUT_CLASS =
  'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'

type CorrectValueDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  detail: TransactionDetail
  columnMapping?: ColumnMapping | null
}

export default function CorrectValueDialog({ open, onOpenChange, reportId, detail, columnMapping }: CorrectValueDialogProps) {
  const createCorrection = useCreateCorrection()
  const [side, setSide] = useState<CorrectionSide>(detail.correctableSides[0] ?? 'A')
  const [field, setField] = useState<CorrectionField>('amount')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')

  // Same render-time reset as ExplainBreakDialog: a fresh open starts empty.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSide(detail.correctableSides[0] ?? 'A')
      setField('amount')
      setValue('')
      setReason('')
      createCorrection.reset()
    }
  }

  const original = sourceCellValue(side === 'A' ? detail.rawA : detail.rawB, columnMapping, side, field)
  const replacesPending = detail.corrections.some((c) => !c.applied && c.side === side && c.field === field)
  const valueError = createCorrection.error instanceof ApiError && createCorrection.error.status === 422 ? createCorrection.error.detail : null

  const changeValue = (next: string) => {
    setValue(next)
    if (valueError) createCorrection.reset()
  }

  const handleSubmit = () => {
    createCorrection.mutate(
      { id: reportId, input: { rowId: detail.id, side, field, correctedValue: value.trim(), reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success('Correction saved. Rerun to apply it')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-cols-1 border border-line bg-surface-raised p-3.5 text-foreground sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-400/15">
            <PencilLine className="h-6 w-6 text-hue-orange" />
          </div>
          <div className="min-w-0 flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-foreground">Correct a value</DialogTitle>
            <DialogDescription className="text-sm text-fg-muted">
              <TruncateTooltip as="span" className="block truncate" tooltip={DESCRIPTION}>
                {DESCRIPTION}
              </TruncateTooltip>
            </DialogDescription>
          </div>
        </DialogHeader>

        <CorrectionTargetFields
          sides={detail.correctableSides}
          side={side}
          onSideChange={setSide}
          field={field}
          onFieldChange={(next) => {
            setField(next)
            changeValue('')
          }}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-fg-muted">In the file</span>
            {replacesPending && <span className="text-warning-soft">Replaces the pending correction</span>}
          </div>
          <p className="truncate rounded-lg border border-dashed border-line px-3 py-2.5 text-sm text-fg-muted">{original ?? 'Empty'}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-fg-muted">Corrected value</label>
          {field === 'amount' ? (
            <MoneyInput
              allowNegative
              value={value}
              onValueChange={changeValue}
              placeholder="e.g. 1,250.00"
              className={`${INPUT_CLASS} ${valueError ? 'border-red-500/70' : ''}`}
            />
          ) : (
            <input
              type={field === 'date' ? 'date' : 'text'}
              value={value}
              onChange={(e) => changeValue(field === 'currency' ? e.target.value.toUpperCase() : e.target.value)}
              maxLength={field === 'currency' ? 3 : CORRECTED_VALUE_MAX_LENGTH}
              placeholder={field === 'currency' ? 'e.g. USD' : undefined}
              className={`${INPUT_CLASS} ${valueError ? 'border-red-500/70' : ''}`}
            />
          )}
          {valueError && <p className="text-xs text-hue-red">{valueError}</p>}
        </div>

        <ResolutionNoteField label="Reason (required)" value={reason} onChange={setReason} placeholder="e.g. Bank export truncated the reference" />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={createCorrection.isPending || !value.trim() || !reason.trim()}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-1 bg-orange-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createCorrection.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {createCorrection.isPending ? 'Saving correction...' : 'Save correction'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
