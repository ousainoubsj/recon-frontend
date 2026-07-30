'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useMappingPreview, useReport } from '@/lib/hooks/useReports'
import { useWizardStore } from '@/stores/wizard-store'
import { formatFileSize, formatNumber, formatPercent } from '@/lib/format'
import type { ColumnMapping } from '@/types/wizard'
import type { MappingPreviewFile } from '@/types/reports'

type CanonicalField = 'referenceNumber' | 'amount' | 'transactionDate' | 'currency'

const CANONICAL_FIELDS: { field: CanonicalField; label: string }[] = [
  { field: 'referenceNumber', label: 'Reference Number' },
  { field: 'amount', label: 'Amount' },
  { field: 'transactionDate', label: 'Transaction Date' },
  { field: 'currency', label: 'Currency' },
]

// Currency is the only optional field (Reference Number/Amount/Transaction
// Date are required to run a reconciliation), so it's the only one that
// offers an explicit "don't map this" escape hatch out of an auto-suggested
// or previously-saved column.
const NONE_VALUE = '__none__'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-300">{children}</span>
      <Info className="h-3.5 w-3.5 text-slate-500" />
    </div>
  )
}

function FilePreviewCardSkeleton({ accent }: { accent: string }) {
  return (
    <div
      className="min-w-0 flex-1 rounded-2xl border p-6"
      style={{ background: `radial-gradient(140% 120% at 0% 0%, ${accent}1f, transparent 30%), #0E182D`, borderColor: `${accent}38` }}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
      </div>

      {/* Matches the real card's divide-x column dividers, not just gaps. */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#1B2540] border-b border-[#1B2540] pb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={i === 0 ? 'space-y-1.5' : 'space-y-1.5 pl-4'}>
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>

      {/* Sized to a real header row + 7 data rows, not one undersized blob. */}
      <div className="mt-5">
        <Skeleton className="mb-2 h-3 w-32" />
        <div className="rounded-lg border border-[#1B2540]">
          <div className="flex gap-4 bg-white/3 px-3 py-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-3 w-14" />
            ))}
          </div>
          <div className="divide-y divide-[#1B2540]">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4 px-3 py-2">
                {[0, 1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-3 w-14" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Each row leaves room for a confidence-badge-shaped skeleton
          alongside the select, matching the real two-part layout. */}
      <div className="mt-5 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <Skeleton className="mb-1.5 h-3 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 flex-1 rounded-md" />
              <Skeleton className="h-8 w-12 shrink-0 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilePreviewCard({
  accent,
  title,
  file,
  selection,
  savedMapping,
  onSelectionChange,
}: {
  accent: string
  title: string
  file: MappingPreviewFile
  selection: Partial<Record<CanonicalField, string>>
  savedMapping?: Partial<Record<CanonicalField, string>>
  onSelectionChange: (field: CanonicalField, value: string) => void
}) {
  const previewColumns = file.previewRows.length > 0 ? Object.keys(file.previewRows[0]) : []

  return (
    <div
      className="min-w-0 flex-1 rounded-2xl border p-6"
      style={{
        background: `radial-gradient(140% 120% at 0% 0%, ${accent}1f, transparent 30%), #0E182D`,
        borderColor: `${accent}38`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent}26`, color: accent }}
        >
          <FileSpreadsheet className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <TruncateTooltip as="p" className="mt-0.5 truncate text-sm text-slate-400" tooltip={file.filename ?? 'Untitled'}>
            {file.filename ?? 'Untitled'}
          </TruncateTooltip>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#1B2540] border-b border-[#1B2540] pb-5">
        <div>
          <p className="text-xs text-slate-400">Rows</p>
          <p className="mt-1 text-base font-semibold text-white">{formatNumber(file.rows)}</p>
        </div>
        <div className="pl-4">
          <p className="text-xs text-slate-400">Columns</p>
          <p className="mt-1 text-base font-semibold text-white">{formatNumber(file.columns)}</p>
        </div>
        <div className="pl-4">
          <p className="text-xs text-slate-400">File Size</p>
          <p className="mt-1 text-base font-semibold text-white">{formatFileSize(file.fileSizeBytes)}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-400">Preview (First 7 rows)</p>
        <ScrollArea className="min-w-0 rounded-lg border border-[#1B2540]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-left text-slate-300">
                {previewColumns.map((col) => (
                  <th key={col} className="px-3 py-2 font-medium text-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2540]">
              {file.previewRows.map((row, i) => (
                <tr key={i}>
                  {previewColumns.map((col) => (
                    <td key={col} className="px-3 py-2 text-nowrap text-slate-300">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="mt-5 space-y-4">
        {CANONICAL_FIELDS.map(({ field, label }) => {
          const suggestion = file.mappings.find((m) => m.field === field)
          // A previously-saved mapping (from "Save Draft" or a Saved
          // Template) wins over the freshly auto-suggested value — resuming
          // a draft shouldn't silently revert to the auto-detected columns.
          // Currency defaults to explicitly unmapped rather than whatever
          // the heuristic auto-detects, since it's the one optional field.
          const defaultValue = field === 'currency' ? NONE_VALUE : suggestion?.value
          const value = selection[field] ?? savedMapping?.[field] ?? defaultValue ?? undefined
          // Base UI's <Select.Value> renders the raw value unless given an
          // items map, so the NONE_VALUE sentinel needs an explicit label
          // here or the trigger would literally show "__none__".
          const items: Record<string, string> = {
            ...(field === 'currency' ? { [NONE_VALUE]: "Don't map this field" } : {}),
            ...Object.fromEntries(previewColumns.map((col) => [col, col])),
          }
          return (
            <div key={field}>
              <div className="mb-1.5">
                <FieldLabel>{label}</FieldLabel>
              </div>
              <div className="flex items-center gap-3">
                <Select value={value} onValueChange={(v) => v && onSelectionChange(field, v)} items={items}>
                  <SelectTrigger
                    className="h-10 flex-1 justify-between bg-[#0D152A] text-slate-200"
                    style={{ borderColor: accent }}
                  >
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {field === 'currency' && (
                      <SelectItem value={NONE_VALUE} className="text-slate-400 italic">
                        Don&apos;t map this field
                      </SelectItem>
                    )}
                    {previewColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Only claim a "confidence" score when the value shown is
                    actually the auto-detected one — suggestion.value is
                    null (confidence 0) when nothing cleared the matching
                    threshold, which isn't a real suggestion to badge. An
                    explicit "don't map" choice gets the same neutral badge
                    as "no confident suggestion", rather than hiding the
                    indicator entirely. */}
                {value !== NONE_VALUE && suggestion?.value && value === suggestion.value ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-emerald-400">{suggestion.confidence}%</p>
                      <p className="text-[11px] text-slate-500">Confidence</p>
                    </div>
                  </div>
                ) : value === NONE_VALUE || !suggestion?.value ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-500">None</p>
                      <p className="text-[11px] text-slate-500">Confidence</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ValidationSummary({ fileA, fileB }: { fileA: MappingPreviewFile; fileB: MappingPreviewFile }) {
  const totalRows = fileA.rows + fileB.rows
  const totalMissing = fileA.missingValues.count + fileB.missingValues.count
  const totalDuplicates = fileA.duplicateReferences.count + fileB.duplicateReferences.count
  const missingPercent = totalRows > 0 ? (totalMissing / totalRows) * 100 : 0
  const duplicatePercent = totalRows > 0 ? (totalDuplicates / totalRows) * 100 : 0

  const fileStatus = (file: MappingPreviewFile) => file.missingValues.count + file.duplicateReferences.count === 0

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-[#232D47] bg-[#0E182D] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h3 className="text-base leading-tight font-semibold text-white">
          Validation
          <br />
          Summary
        </h3>
      </div>

      {[
        { label: 'Internal Ledger', file: fileA },
        { label: 'Counterparty File', file: fileB },
      ].map(({ label, file }) => (
        <div key={label} className="border-l border-[#1B2540] pl-6">
          <p className="text-sm text-slate-300">{label}</p>
          {fileStatus(file) ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              All good
            </p>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              {file.missingValues.count + file.duplicateReferences.count} issue(s)
            </p>
          )}
        </div>
      ))}

      <div className="border-l border-[#1B2540] pl-6">
        <p className="flex items-center gap-1.5 text-sm text-slate-300">Missing Values</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-base font-semibold text-white">
          {formatNumber(totalMissing)}
          <span className="text-xs font-normal text-slate-500">({formatPercent(missingPercent, 2)})</span>
        </p>
      </div>
      <div className="border-l border-[#1B2540] pl-6">
        <p className="flex items-center gap-1.5 text-sm text-slate-300">
          {totalDuplicates > 0 && <AlertTriangle className="h-4 w-4 text-amber-400" />}
          Duplicate References
        </p>
        <p
          className={`mt-1.5 flex items-center gap-1.5 text-base font-semibold ${totalDuplicates > 0 ? 'text-amber-400' : 'text-white'}`}
        >
          {formatNumber(totalDuplicates)}
          <span className="text-xs font-normal text-slate-500">({formatPercent(duplicatePercent, 2)})</span>
        </p>
      </div>
    </div>
  )
}

function ValidationSummarySkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-[#232D47] bg-[#0E182D] p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5 border-l border-[#1B2540] pl-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

type ColumnMappingBoardProps = {
  reportId: string
  onContinue: (name: string) => void
  isSubmitting?: boolean
  submitError?: string | null
}

export default function ColumnMappingBoard({ reportId, onContinue, isSubmitting, submitError }: ColumnMappingBoardProps) {
  const { data: report } = useReport(reportId)
  const [nameOverride, setNameOverride] = useState<string | undefined>(undefined)
  const reconciliationName = nameOverride ?? report?.name ?? ''

  const [selectionA, setSelectionA] = useState<Partial<Record<CanonicalField, string>>>({})
  const [selectionB, setSelectionB] = useState<Partial<Record<CanonicalField, string>>>({})
  const setColumnMapping = useWizardStore((s) => s.setColumnMapping)
  const setStoreName = useWizardStore((s) => s.setName)

  const { data: preview, isLoading } = useMappingPreview(reportId)
  const savedMapping: ColumnMapping | undefined = report?.columnMapping ?? undefined

  const effective = (
    file: MappingPreviewFile | undefined,
    selection: Partial<Record<CanonicalField, string>>,
    saved: Partial<Record<CanonicalField, string>> | undefined,
  ) => {
    const result: Partial<Record<CanonicalField, string>> = {}
    for (const { field } of CANONICAL_FIELDS) {
      const suggestion = file?.mappings.find((m) => m.field === field)?.value ?? undefined
      // A previously-saved mapping wins over the freshly auto-suggested
      // value — resuming a draft shouldn't silently revert to whatever the
      // system auto-detects this time. Currency defaults to unmapped (see
      // the matching default in FilePreviewCard above).
      const defaultValue = field === 'currency' ? NONE_VALUE : suggestion
      const value = selection[field] ?? saved?.[field] ?? defaultValue
      if (value && value !== NONE_VALUE) result[field] = value
    }
    return result
  }

  const effectiveA = effective(preview?.fileA, selectionA, savedMapping?.fileA)
  const effectiveB = effective(preview?.fileB, selectionB, savedMapping?.fileB)

  useEffect(() => {
    if (!preview) return
    setColumnMapping({ fileA: effectiveA, fileB: effectiveB })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, selectionA, selectionB, savedMapping])

  useEffect(() => {
    setStoreName(reconciliationName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconciliationName])

  const isMappingComplete = Boolean(
    effectiveA.referenceNumber && effectiveA.amount && effectiveA.transactionDate &&
    effectiveB.referenceNumber && effectiveB.amount && effectiveB.transactionDate,
  )

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Map your columns</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">
            Map the important columns from both files. Our system has auto-detected the best matches.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => onContinue(reconciliationName)}
          disabled={!isMappingComplete || isLoading || isSubmitting}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 font-medium text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Running...' : 'Continue'}
        </Button>
      </div>

      {submitError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {submitError}
        </div>
      )}

      <div className="flex min-w-0 flex-col items-stretch gap-4 lg:flex-row">
        {isLoading || !preview ? (
          <FilePreviewCardSkeleton accent="#04E2B8" />
        ) : (
          <FilePreviewCard
            accent="#04E2B8"
            title="Internal Ledger"
            file={preview.fileA}
            selection={selectionA}
            savedMapping={savedMapping?.fileA}
            onSelectionChange={(field, value) => setSelectionA((prev) => ({ ...prev, [field]: value }))}
          />
        )}

        {/* Purely decorative + the name input, neither of which depends on
            mapping-preview data — stays visible during that load instead of
            disappearing behind a skeleton for something it doesn't need. */}
        <div className="relative hidden w-64 shrink-0 lg:block">
          <div className="absolute left-1/2 z-10 w-56 -translate-x-1/2 -translate-y-full text-center" style={{ top: '23%' }}>
            <p className="text-xs font-medium text-slate-300">Reconciliation Name</p>
            <input
              type="text"
              value={reconciliationName}
              onChange={(e) => setNameOverride(e.target.value)}
              placeholder="e.g. June Bank Reconciliation"
              className="mt-1.5 w-full rounded-lg border border-gray-600 bg-[#0A1128]/70 px-3 py-2 text-center text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            <path d="M 0 30 C 25 30, 35 50, 50 50" fill="none" stroke="#34d399" strokeWidth="0.5" />
            <path d="M 50 50 C 65 50, 75 30, 100 30" fill="none" stroke="#34d399" strokeWidth="0.5" />
            <path d="M 0 57 L 28.1 57" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            <path d="M 71.9 57 L 100 57" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            <path d="M 0 77 C 25 77, 35 64, 50 64" fill="none" stroke="#fb923c" strokeWidth="0.5" />
            <path d="M 50 64 C 65 64, 75 77, 100 77" fill="none" stroke="#fb923c" strokeWidth="0.5" />
          </svg>

          {[
            { x: 0, y: 30, color: '#34d399' },
            { x: 100, y: 30, color: '#34d399' },
            { x: 50, y: 50, color: '#34d399' },
            { x: 0, y: 57, color: '#38bdf8' },
            { x: 100, y: 57, color: '#38bdf8' },
            { x: 28.1, y: 57, color: '#38bdf8' },
            { x: 71.9, y: 57, color: '#38bdf8' },
            { x: 0, y: 77, color: '#fb923c' },
            { x: 100, y: 77, color: '#fb923c' },
            { x: 50, y: 64, color: '#fb923c' },
          ].map((dot, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#0B122B]"
              style={{ left: `${dot.x}%`, top: `${dot.y}%`, backgroundColor: dot.color, boxShadow: `0 0 8px 1px ${dot.color}99` }}
            />
          ))}

          <div
            className="absolute left-1/2 top-[57%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl"
            style={{ boxShadow: '0 0 60px 10px rgba(45, 212, 191, 0.15)' }}
          >
            <div className="absolute -inset-3.5 rounded-[28px] border border-teal-400/20" />
            <div className="absolute -inset-7 rounded-[36px] border border-teal-400/10" />
            <Image src="/images/logo-sym.png" alt="" width={112} height={112} className="relative rounded-3xl" />
          </div>

          <div className="absolute left-1/2 w-56 -translate-x-1/2 text-center" style={{ top: '84%' }}>
            <p className="text-sm font-semibold text-sky-300">Smart Matching Engine</p>
            <p className="mt-1.5 text-xs text-slate-400">Matches transactions using your rules and tolerances</p>
          </div>
        </div>

        {isLoading || !preview ? (
          <FilePreviewCardSkeleton accent="#9366DE" />
        ) : (
          <FilePreviewCard
            accent="#9366DE"
            title="Counterparty Statement"
            file={preview.fileB}
            selection={selectionB}
            savedMapping={savedMapping?.fileB}
            onSelectionChange={(field, value) => setSelectionB((prev) => ({ ...prev, [field]: value }))}
          />
        )}
      </div>

      {preview ? <ValidationSummary fileA={preview.fileA} fileB={preview.fileB} /> : <ValidationSummarySkeleton />}
    </div>
  )
}
