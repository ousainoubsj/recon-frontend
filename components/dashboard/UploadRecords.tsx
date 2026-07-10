'use client'

import { useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
}: {
  label: string
  file: File | null
  onSelect: (file: File) => void
  onClear: () => void
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
        <div className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#111C3D]/60 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-200">{file.name}</p>
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
          className={`flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 py-6 text-center transition-colors ${
            isDragging ? 'border-teal-400/70 bg-teal-400/5' : 'border-[#232D47] hover:border-[#2E3A5C] hover:bg-white/5'
          }`}
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
      <DialogContent className="border border-[#232D47] bg-[#0E182D] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Records</DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload your internal record and the counterparty record to start reconciliation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FileDropzone
            label="Internal Record"
            file={internalFile}
            onSelect={setInternalFile}
            onClear={() => setInternalFile(null)}
          />
          <FileDropzone
            label="Counterparty Record"
            file={counterpartyFile}
            onSelect={setCounterpartyFile}
            onClear={() => setCounterpartyFile(null)}
          />
        </div>

        <DialogFooter className="-mx-4 -mb-4 rounded-b-xl border-t border-[#232D47] bg-[#0D152A] p-4">
          <Button
            type="button"
            variant="outline"
            className="border-[#232D47] bg-transparent text-white hover:bg-white/5"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canStart}
            onClick={handleStart}
            className="bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 text-white hover:opacity-90"
          >
            Start Reconciliation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
