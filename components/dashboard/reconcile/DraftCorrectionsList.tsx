'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, Loader2, PencilLine, Trash2 } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { CORRECTION_FIELD_LABEL, CORRECTION_SIDE_LABEL } from '@/lib/corrections'
import { formatNumber } from '@/lib/format'
import { useDeleteCorrection, useReportCorrections } from '@/lib/hooks/useReports'
import { toast } from '@/lib/toast'

// The corrections a rerun draft carried over from its source; the run applies all of them.
export default function DraftCorrectionsList({ reportId }: { reportId: string }) {
  const { data: corrections } = useReportCorrections(reportId)
  const deleteCorrection = useDeleteCorrection()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!corrections || corrections.length === 0) return null

  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-sm"
      >
        <span className="flex items-center gap-2 text-orange-200">
          <PencilLine className="h-4 w-4 shrink-0 text-orange-300" />
          {formatNumber(corrections.length)} {corrections.length === 1 ? 'correction' : 'corrections'} will be applied
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-orange-300">
          {isExpanded ? 'Hide' : 'Show'}
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {isExpanded && (
        <ul className="mt-3 divide-y divide-[#232D47] border-t border-[#232D47]">
          {corrections.map((correction) => (
            <li key={correction.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="w-56 shrink-0 text-xs text-slate-400">
                {CORRECTION_SIDE_LABEL[correction.side]} · row {formatNumber(correction.rowIndex + 1)} ·{' '}
                {CORRECTION_FIELD_LABEL[correction.field]}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                <TruncateTooltip as="span" className="truncate text-slate-500 line-through" tooltip={correction.originalValue ?? 'Empty'}>
                  {correction.originalValue ?? 'Empty'}
                </TruncateTooltip>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <TruncateTooltip as="span" className="truncate font-medium text-white" tooltip={correction.correctedValue}>
                  {correction.correctedValue}
                </TruncateTooltip>
              </span>
              <TruncateTooltip as="span" className="hidden min-w-0 flex-1 truncate text-xs text-slate-400 md:block" tooltip={correction.reason}>
                {correction.reason}
              </TruncateTooltip>
              <button
                type="button"
                onClick={() =>
                  deleteCorrection.mutate(
                    { id: reportId, correctionId: correction.id },
                    { onSuccess: () => toast.success('Correction removed') },
                  )
                }
                disabled={deleteCorrection.isPending}
                className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteCorrection.isPending && deleteCorrection.variables?.correctionId === correction.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
