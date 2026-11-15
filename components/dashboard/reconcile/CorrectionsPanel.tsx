'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, PencilLine, Trash2 } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { CORRECTION_FIELD_LABEL, CORRECTION_SIDE_LABEL } from '@/lib/corrections'
import { useCanEditReports, useDeleteCorrection, useReport } from '@/lib/hooks/useReports'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { toast } from '@/lib/toast'
import type { TransactionDetail } from '@/types/reports'
import type { ColumnMapping } from '@/types/wizard'
import CorrectValueDialog from './CorrectValueDialog'
import CorrectionBadge from './CorrectionBadge'

type CorrectionsPanelProps = {
  reportId: string
  detail: TransactionDetail
  columnMapping?: ColumnMapping | null
}

export default function CorrectionsPanel({ reportId, detail, columnMapping }: CorrectionsPanelProps) {
  const { formatDateTime } = useOrgFormat()
  const canEdit = useCanEditReports()
  const { data: report } = useReport(reportId)
  const deleteCorrection = useDeleteCorrection()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // A superseded report is read-only: changes continue on its newer run.
  const canCorrect = canEdit && !report?.supersededBy
  const isPreFeatureRow = detail.correctableSides.length === 0

  if (detail.corrections.length === 0 && !canCorrect) return null

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">Corrections</h4>
        {canCorrect && !isPreFeatureRow && (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-hue-orange-soft hover:text-hue-orange-soft"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Correct value
          </button>
        )}
      </div>

      {canCorrect && isPreFeatureRow && (
        <p className="text-xs text-fg-muted">Corrections need a rerun: this reconciliation ran before they were available.</p>
      )}
      {detail.corrections.length === 0 && !isPreFeatureRow && (
        <p className="text-xs text-fg-muted">Fix a wrong reference, amount, date or currency without re-exporting the file.</p>
      )}

      {detail.corrections.map((correction) => (
        <div key={correction.id} className="space-y-1.5 border-t border-line pt-3 first-of-type:border-t-0 first-of-type:pt-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-fg-muted">
              {CORRECTION_FIELD_LABEL[correction.field]} · {CORRECTION_SIDE_LABEL[correction.side]}
            </span>
            <CorrectionBadge applied={correction.applied} />
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <TruncateTooltip as="span" className="truncate text-fg-subtle line-through" tooltip={correction.originalValue ?? 'Empty'}>
              {correction.originalValue ?? 'Empty'}
            </TruncateTooltip>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
            <TruncateTooltip as="span" className="truncate font-medium text-foreground" tooltip={correction.correctedValue}>
              {correction.correctedValue}
            </TruncateTooltip>
          </div>
          <p className="text-sm whitespace-pre-wrap text-fg-secondary">{correction.reason}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-fg-subtle">
              {correction.createdBy?.name ?? 'A former member'} · {formatDateTime(correction.createdAt)}
            </p>
            {canCorrect && !correction.applied && (
              <button
                type="button"
                onClick={() =>
                  deleteCorrection.mutate(
                    { id: reportId, correctionId: correction.id },
                    { onSuccess: () => toast.success('Correction removed') },
                  )
                }
                disabled={deleteCorrection.isPending}
                className="flex cursor-pointer items-center gap-1 text-xs font-medium text-fg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteCorrection.isPending && deleteCorrection.variables?.correctionId === correction.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      {canCorrect && !isPreFeatureRow && (
        <CorrectValueDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          reportId={reportId}
          detail={detail}
          columnMapping={columnMapping}
        />
      )}
    </div>
  )
}
