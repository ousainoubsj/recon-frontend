'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import type { MappingPreviewState } from '@/types/reports'
import ReplaceFileButton from './ReplaceFileButton'

type MappingPreviewStatusProps = {
  reportId: string
  state: MappingPreviewState
  fileAName: string | null
  fileBName: string | null
  disabled?: boolean
}

// The mapping step's banner while the files are parsed in the background, or when the parser couldn't read one.
export default function MappingPreviewStatus({ reportId, state, fileAName, fileBName, disabled }: MappingPreviewStatusProps) {
  if (state.status === 'pending') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky-300" />
        <span className="min-w-0 truncate">
          Reading {fileAName ?? 'your ledger'} and {fileBName ?? 'your statement'}… large files take a few seconds.
        </span>
      </div>
    )
  }

  if (state.status !== 'failed') return null

  return (
    <div className="space-y-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm">
      <p className="flex items-start gap-2 text-rose-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        <span>{state.error ?? "One of the files couldn't be read."} Replace it with a CSV or Excel export to continue.</span>
      </p>
      <div className="flex flex-wrap gap-4">
        {(['A', 'B'] as const).map((side) => (
          <div key={side} className="flex items-center gap-2 text-xs text-slate-300">
            <span>{side === 'A' ? 'Internal ledger' : 'Counterparty statement'}</span>
            <ReplaceFileButton reportId={reportId} side={side} disabled={disabled} />
          </div>
        ))}
      </div>
    </div>
  )
}
