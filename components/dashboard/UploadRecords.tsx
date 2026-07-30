'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useUploadFiles } from '@/lib/hooks/useUploadFiles'
import { toastApiError } from '@/lib/toast'
import { formatFileSize } from '@/lib/format'
import { validateFile } from '@/lib/api/files'

type UploadRecordsProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Pre-existing draft to upload into (the Saved Template flow creates the
  // draft with its config pre-applied before reopening this dialog) —
  // omitted for the plain "Upload New Files" flow, which creates its own.
  draftId?: string
  onUploaded?: (reportId: string) => void
}

function FileDropzone({
  label,
  file,
  error,
  onSelect,
  onClear,
  accentColor,
  disabled,
}: {
  label: string
  file: File | null
  error?: string | null
  onSelect: (file: File) => void
  onClear: () => void
  accentColor: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const borderColor = error ? '#f87171' : accentColor

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-white">{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (selected) onSelect(selected)
          e.target.value = ''
        }}
      />

      {file ? (
        <div
          className="flex items-center gap-3 rounded-xl border bg-[#111C3D]/60 p-2"
          style={{ borderColor }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accentColor}26`, color: accentColor }}
          >
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <TruncateTooltip as="p" className="truncate text-sm text-slate-200" tooltip={file.name}>
              {file.name}
            </TruncateTooltip>
            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={onClear}
            disabled={disabled}
            className="shrink-0 cursor-pointer text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const dropped = e.dataTransfer.files?.[0]
            if (dropped) onSelect(dropped)
          }}
          style={{ borderColor, backgroundColor: isDragging ? `${accentColor}1A` : undefined }}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-3 text-center transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload className="h-5 w-5 text-slate-400" />
          <span className="text-xs text-slate-300">
            <span className="font-medium text-sky-400">Click to upload</span> or drag and drop
          </span>
          <span className="text-[11px] text-slate-500">CSV, XLS, XLSX</span>
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function UploadRecords({ open, onOpenChange, draftId, onUploaded }: UploadRecordsProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [counterpartyFile, setCounterpartyFile] = useState<File | null>(null)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [counterpartyError, setCounterpartyError] = useState<string | null>(null)
  const uploadFiles = useUploadFiles()
  const isUploading = uploadFiles.isPending

  const canStart = Boolean(internalFile && counterpartyFile) && !isUploading

  // Checked immediately on selection/drop — same rules the backend enforces
  // (size, then content type) — rather than only surfacing after a wasted
  // presign+PUT round trip on "Start Reconciliation".
  const handleSelectInternal = (file: File) => {
    const error = validateFile(file)
    setInternalError(error)
    setInternalFile(error ? null : file)
  }

  const handleSelectCounterparty = (file: File) => {
    const error = validateFile(file)
    setCounterpartyError(error)
    setCounterpartyFile(error ? null : file)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next && !isUploading) {
      setInternalFile(null)
      setCounterpartyFile(null)
      setInternalError(null)
      setCounterpartyError(null)
    }
    onOpenChange(next)
  }

  const handleStart = async () => {
    if (!internalFile || !counterpartyFile) return
    try {
      const id = await uploadFiles.mutateAsync({ internal: internalFile, counterparty: counterpartyFile, draftId })
      onUploaded?.(id)
      setInternalFile(null)
      setCounterpartyFile(null)
      setInternalError(null)
      setCounterpartyError(null)
      onOpenChange(false)
    } catch (err) {
      toastApiError(err, 'Failed to upload files')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-4 text-white sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/15">
            <Image src="/icons/upload.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Upload Records</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Upload your internal and counterparty records to start reconciliation.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FileDropzone
            label="Internal Record"
            file={internalFile}
            error={internalError}
            onSelect={handleSelectInternal}
            onClear={() => {
              setInternalFile(null)
              setInternalError(null)
            }}
            accentColor="#04E2B8"
            disabled={isUploading}
          />
          <FileDropzone
            label="Counterparty Record"
            file={counterpartyFile}
            error={counterpartyError}
            onSelect={handleSelectCounterparty}
            onClear={() => {
              setCounterpartyFile(null)
              setCounterpartyError(null)
            }}
            accentColor="#9366DE"
            disabled={isUploading}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
            className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Start Reconciliation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
