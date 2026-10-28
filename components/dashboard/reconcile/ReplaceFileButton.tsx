'use client'

import { useRef } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { CORRECTION_SIDE_LABEL } from '@/lib/corrections'
import { useReportCorrections } from '@/lib/hooks/useReports'
import { useReplaceDraftFile } from '@/lib/hooks/useUploadFiles'
import { validateFile } from '@/lib/files'
import { toast } from '@/lib/toast'

type ReplaceFileButtonProps = {
  reportId: string
  side: 'A' | 'B'
  disabled?: boolean
  // The new file's columns may differ, so the caller drops that side's in-progress column picks.
  onReplaced?: () => void
}

export default function ReplaceFileButton({ reportId, side, disabled, onReplaced }: ReplaceFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const replaceFile = useReplaceDraftFile()
  const { data: corrections } = useReportCorrections(reportId)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    // Corrections point at rows of the old file, so the API drops that side's on replace.
    const droppedCount = corrections?.filter((c) => c.side === side).length ?? 0
    replaceFile.mutate(
      { id: reportId, side, file },
      {
        onSuccess: () => {
          toast.success(`Replaced with ${file.name}`)
          if (droppedCount > 0) {
            const noun = droppedCount === 1 ? 'correction' : 'corrections'
            toast(`${droppedCount} ${CORRECTION_SIDE_LABEL[side].toLowerCase()} ${noun} removed with the old file`)
          }
          onReplaced?.()
        },
      },
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || replaceFile.isPending}
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {replaceFile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
        {replaceFile.isPending ? 'Replacing file...' : 'Replace file'}
      </button>
    </>
  )
}
