'use client'

import { useState } from 'react'
import { PencilLine, RotateCcw } from 'lucide-react'
import { useCanEditReports } from '@/lib/hooks/useReports'
import { formatNumber } from '@/lib/format'
import RerunReportDialog from './RerunReportDialog'

export default function PendingCorrectionsBanner({ reportId, pending }: { reportId: string; pending: number }) {
  const canEdit = useCanEditReports()
  const [isRerunOpen, setIsRerunOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-hue-orange-soft">
        <PencilLine className="h-4 w-4 shrink-0 text-hue-orange-soft" />
        {formatNumber(pending)} {pending === 1 ? 'correction' : 'corrections'} pending. Rerun to apply them; this result stays as it is.
      </span>
      {canEdit && (
        <button
          type="button"
          onClick={() => setIsRerunOpen(true)}
          className="flex cursor-pointer items-center gap-1 font-medium text-hue-orange-soft hover:text-hue-orange-soft"
        >
          <RotateCcw className="h-4 w-4" />
          Rerun with corrections
        </button>
      )}
      <RerunReportDialog open={isRerunOpen} onOpenChange={setIsRerunOpen} reportId={reportId} />
    </div>
  )
}
