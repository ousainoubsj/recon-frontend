'use client'

import Image from 'next/image'
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  Pencil,
  Plus,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

type Mapping = {
  label: string
  value: string
  confidence: number
}

type FileCardData = {
  accent: string
  title: string
  filename: string
  rows: string
  columns: string
  fileSize: string
  previewColumns: string[]
  previewRows: string[][]
  mappings: Mapping[]
}

const internalLedger: FileCardData = {
  accent: '#04E2B8',
  title: 'Internal Ledger',
  filename: 'Internal_Ledger_June.csv',
  rows: '125,430',
  columns: '18',
  fileSize: '24.7 MB',
  previewColumns: ['Transaction_ID', 'Posting Date', 'Debit Amount', 'Currency'],
  previewRows: [
    ['TRX-0001', '01/06/2026', '1,250.00', 'USD'],
    ['TRX-0002', '01/06/2026', '980.50', 'USD'],
    ['TRX-0003', '02/06/2026', '2,450.00', 'USD'],
    ['TRX-0004', '02/06/2026', '760.75', 'USD'],
    ['TRX-0005', '03/06/2026', '1,120.00', 'USD'],
  ],
  mappings: [
    { label: 'Reference Number', value: 'Transaction_ID', confidence: 98 },
    { label: 'Amount', value: 'Debit Amount', confidence: 100 },
    { label: 'Transaction Date', value: 'Posting Date', confidence: 97 },
    { label: 'Currency', value: 'Currency', confidence: 99 },
  ],
}

const counterpartyStatement: FileCardData = {
  accent: '#9366DE',
  title: 'Counterparty Statement',
  filename: 'Bank_Statement_June.csv',
  rows: '124,980',
  columns: '16',
  fileSize: '23.1 MB',
  previewColumns: ['Ref_No', 'Value Date', 'Amount', 'Currency Code'],
  previewRows: [
    ['TRX-0001', '01/06/2026', '1,250.00', 'USD'],
    ['TRX-0002', '01/06/2026', '980.50', 'USD'],
    ['TRX-0003', '02/06/2026', '2,450.00', 'USD'],
    ['TRX-0004', '02/06/2026', '760.75', 'USD'],
    ['TRX-0005', '03/06/2026', '1,120.00', 'USD'],
  ],
  mappings: [
    { label: 'Reference Number', value: 'Ref_No', confidence: 97 },
    { label: 'Amount', value: 'Amount', confidence: 100 },
    { label: 'Transaction Date', value: 'Value Date', confidence: 96 },
    { label: 'Currency', value: 'Currency Code', confidence: 100 },
  ],
}

const validationItems = [
  { label: 'Internal Ledger', kind: 'status' as const },
  { label: 'Counterparty File', kind: 'status' as const },
  { label: 'Missing Values', value: '42', percent: '(0.03%)', tone: 'neutral' as const, kind: 'metric' as const },
  { label: 'Duplicate References', value: '17', percent: '(0.01%)', tone: 'warning' as const, kind: 'metric' as const },
  { label: 'Unsupported Data', value: '0', percent: '(0%)', tone: 'good' as const, kind: 'metric' as const },
]

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-300">{children}</span>
      <Info className="h-3.5 w-3.5 text-slate-500" />
    </div>
  )
}


function FilePreviewCard({ data }: { data: FileCardData }) {
  const { accent, title, filename, rows, columns, fileSize, previewColumns, previewRows, mappings } = data

  return (
    <div
      className="min-w-0 flex-1 rounded-2xl border border-[#232D47] p-6"
      style={{ background: `radial-gradient(120% 100% at 0% 0%, ${accent}12, transparent 60%), #0E182D` }}
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
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
            <span className="truncate">{filename}</span>
            <Pencil className="h-3.5 w-3.5 shrink-0 cursor-pointer hover:text-slate-200" />
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-b border-[#1B2540] pb-5">
        <div>
          <p className="text-xs text-slate-400">Rows</p>
          <p className="mt-1 text-base font-semibold text-white">{rows}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Columns</p>
          <p className="mt-1 text-base font-semibold text-white">{columns}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">File Size</p>
          <p className="mt-1 text-base font-semibold text-white">{fileSize}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-400">Preview (First 5 rows)</p>
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
              {previewRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-nowrap text-slate-300">
                      {cell}
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
        {mappings.map((mapping) => (
          <div key={mapping.label}>
            <div className="mb-1.5">
              <FieldLabel>{mapping.label}</FieldLabel>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue={mapping.value}>
                <SelectTrigger
                  className="h-10 flex-1 justify-between bg-[#0D152A] text-slate-200"
                  style={{ borderColor: accent }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {previewColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex shrink-0 items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-emerald-400">{mapping.confidence}%</p>
                  <p className="text-[11px] text-slate-500">Confidence</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-400 hover:underline"
      >
        <Plus className="h-4 w-4" />
        Map additional columns
      </button>
    </div>
  )
}

const connectorDots = [
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
]

function MatchConnector() {
  return (
    <div className="relative hidden w-64 shrink-0 lg:block">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M 0 30 C 25 30, 35 50, 50 50" fill="none" stroke="#34d399" strokeWidth="0.5" />
        <path d="M 50 50 C 65 50, 75 30, 100 30" fill="none" stroke="#34d399" strokeWidth="0.5" />

        <path d="M 0 57 L 28.1 57" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
        <path d="M 71.9 57 L 100 57" fill="none" stroke="#38bdf8" strokeWidth="0.5" />

        <path d="M 0 77 C 25 77, 35 64, 50 64" fill="none" stroke="#fb923c" strokeWidth="0.5" />
        <path d="M 50 64 C 65 64, 75 77, 100 77" fill="none" stroke="#fb923c" strokeWidth="0.5" />
      </svg>

      {connectorDots.map((dot, i) => (
        <span
          key={i}
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#0B122B]"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            backgroundColor: dot.color,
            boxShadow: `0 0 8px 1px ${dot.color}99`,
          }}
        />
      ))}

      <div
        className="absolute left-1/2 top-[57%] flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl"
        style={{
          boxShadow: '0 0 60px 10px rgba(45, 212, 191, 0.15)',
        }}
      >
        <div className="absolute inset-[-14px] rounded-[28px] border border-teal-400/20" />
        <div className="absolute inset-[-28px] rounded-[36px] border border-teal-400/10" />
        <Image src="/images/logo-sym.png" alt="" width={112} height={112} className="relative rounded-3xl" />
      </div>


      <div className="absolute left-1/2 w-56 -translate-x-1/2 text-center" style={{ top: '84%' }}>
        <p className="text-sm font-semibold text-sky-300">Smart Matching Engine</p>
        <p className="mt-1.5 text-xs text-slate-400">Matches transactions using your rules and tolerances</p>
      </div>
    </div>
  )
}

function ValidationSummary() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
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

      {validationItems.map((item) =>
        item.kind === 'status' ? (
          <div key={item.label} className="border-l border-[#1B2540] pl-6">
            <p className="text-sm text-slate-300">{item.label}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              All good
            </p>
          </div>
        ) : (
          <div key={item.label} className="border-l border-[#1B2540] pl-6">
            <p className="flex items-center gap-1.5 text-sm text-slate-300">
              {item.tone === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {item.label}
            </p>
            <p
              className={`mt-1.5 flex items-center gap-1.5 text-base font-semibold ${
                item.tone === 'warning' ? 'text-amber-400' : item.tone === 'good' ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {item.value}
              <span className="text-xs font-normal text-slate-500">{item.percent}</span>
            </p>
          </div>
        )
      )}
    </div>
  )
}

export default function ColumnMappingBoard() {
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Map your columns</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">
            Map the important columns from both files. Our system has auto-detected the best matches.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#232D47] bg-[#0E182D] px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-300">
            AI
          </span>
          <div>
            <p className="text-xs text-slate-400">AI Detection Confidence</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-400">High</span>
              <div className="h-1.5 w-32 rounded-full bg-[#1B2540]">
                <div className="h-1.5 w-[96%] rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-white">96%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-stretch gap-4 lg:flex-row">
        <FilePreviewCard data={internalLedger} />
        <MatchConnector />
        <FilePreviewCard data={counterpartyStatement} />
      </div>

      <ValidationSummary />
    </div>
  )
}
