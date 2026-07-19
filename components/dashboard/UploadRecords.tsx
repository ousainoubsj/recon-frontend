'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { FileText, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type UploadRecordsProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart?: (files: { internal: File; counterparty: File }) => void
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileDropzone({
  label,
  file,
  onSelect,
  onClear,
  accentColor,
}: {
  label: string
  file: File | null
  onSelect: (file: File) => void
  onClear: () => void
  accentColor: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        }}
      />

      {file ? (
        <div
          className="flex items-center gap-3 rounded-xl border bg-[#111C3D]/60 p-2"
          style={{ borderColor: accentColor }}
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
            className="shrink-0 cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
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
          style={{ borderColor: accentColor, backgroundColor: isDragging ? `${accentColor}1A` : undefined }}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-3 text-center transition-colors hover:bg-white/5"
        >
          <Upload className="h-5 w-5 text-slate-400" />
          <span className="text-xs text-slate-300">
            <span className="font-medium text-sky-400">Click to upload</span> or drag and drop
          </span>
          <span className="text-[11px] text-slate-500">CSV, XLS, XLSX</span>
        </button>
      )}
    </div>
  )
}

export default function UploadRecords({ open, onOpenChange, onStart }: UploadRecordsProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [counterpartyFile, setCounterpartyFile] = useState<File | null>(null)

  const canStart = Boolean(internalFile && counterpartyFile)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setInternalFile(null)
      setCounterpartyFile(null)
    }
    onOpenChange(next)
  }

  const handleStart = () => {
    if (!internalFile || !counterpartyFile) return
    onStart?.({ internal: internalFile, counterparty: counterpartyFile })
    handleOpenChange(false)
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
            onSelect={setInternalFile}
            onClear={() => setInternalFile(null)}
            accentColor="#04E2B8"
          />
          <FileDropzone
            label="Counterparty Record"
            file={counterpartyFile}
            onSelect={setCounterpartyFile}
            onClear={() => setCounterpartyFile(null)}
            accentColor="#9366DE"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="flex-1 cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Reconciliation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
