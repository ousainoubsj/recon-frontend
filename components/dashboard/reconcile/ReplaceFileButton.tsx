'use client'

import { useRef } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
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

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    replaceFile.mutate(
      { id: reportId, side, file },
      {
        onSuccess: () => {
          toast.success(`Replaced with ${file.name}`)
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
