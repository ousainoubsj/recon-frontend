'use client'

import { useState } from 'react'
import { CalendarClock, Check, ChevronDown, FileChartColumn, FileSpreadsheet, FileText } from 'lucide-react'

type FormatKey = 'pdf' | 'excel'

const formatOptions: {
  key: FormatKey
  label: string
  Icon: typeof FileText
  iconClassName: string
  selectedClassName: string
}[] = [
  {
    key: 'pdf',
    label: 'PDF',
    Icon: FileText,
    iconClassName: 'text-rose-400',
    selectedClassName: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
  },
  {
    key: 'excel',
    label: 'Excel',
    Icon: FileSpreadsheet,
    iconClassName: 'text-emerald-400',
    selectedClassName: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  },
]

type CustomizeKey = 'summary' | 'matchStatistics' | 'breakAnalysis' | 'unmatchedDetails' | 'chartsAndGraphs'

const customizeOptions: { key: CustomizeKey; label: string }[] = [
  { key: 'summary', label: 'Include Summary' },
  { key: 'matchStatistics', label: 'Include Match Statistics' },
  { key: 'breakAnalysis', label: 'Include Break Analysis' },
  { key: 'unmatchedDetails', label: 'Include Unmatched Details' },
  { key: 'chartsAndGraphs', label: 'Include Charts & Graphs' },
]

export default function ReportBuilder() {
  const [format, setFormat] = useState<FormatKey>('pdf')
  const [customize, setCustomize] = useState<Record<CustomizeKey, boolean>>({
    summary: true,
    matchStatistics: true,
    breakAnalysis: true,
    unmatchedDetails: true,
    chartsAndGraphs: false,
  })

  const toggleCustomize = (key: CustomizeKey) => {
    setCustomize((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
      <h3 className="text-base font-semibold text-white">Create New Report</h3>

      <div className="mt-5 space-y-2">
        <p className="text-sm text-slate-400">1. Select Reconciliation</p>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#232D47] bg-[#0A1128] px-4 py-3 text-left hover:bg-white/5"
        >
          <span>
            <span className="block font-medium text-white">June Bank Reconciliation</span>
            <span className="mt-0.5 block text-xs text-slate-400">Jun 30, 2026 10:27 AM</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-sm text-slate-400">2. Select Template</p>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#232D47] bg-[#0A1128] px-4 py-3 text-sm font-medium text-white hover:bg-white/5"
        >
          Reconciliation Summary
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-400">3. Customize Report</p>
        <div className="mt-3 space-y-3">
          {customizeOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCustomize(key)}
              className="flex w-full cursor-pointer items-center gap-3 text-left"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                  customize[key] ? 'border-emerald-500 bg-emerald-500' : 'border-[#232D47] bg-transparent'
                }`}
              >
                {customize[key] && <Check className="h-3.5 w-3.5 text-[#050F20]" />}
              </span>
              <span className="text-sm text-slate-300">{label}</span>
            </button>
          ))}
        </div>

      </div>

      <div className="mt-5 space-y-2">
        <p className="text-sm text-slate-400">4. Choose Format</p>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map(({ key, label, Icon, iconClassName, selectedClassName }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                format === key ? selectedClassName : 'border-[#232D47] text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${format === key ? '' : iconClassName}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
      >
        <FileChartColumn className="h-4 w-4" />
        Generate Report
      </button>

      <button
        type="button"
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#232D47] py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
      >
        <CalendarClock className="h-4 w-4" />
        Schedule Report
      </button>
    </div>
  )
}
