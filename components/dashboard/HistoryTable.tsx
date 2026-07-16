'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  MoreVertical,
  Search,
  Star,
} from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Tag = 'Bank' | 'Supplier' | 'Year End'
type Status = 'Completed' | 'Completed with Issues'

type ReconciliationRow = {
  name: string
  tag: Tag
  fileA: string
  fileB: string
  date: string
  time: string
  matchRate: number
  breakValue: string
  status: Status
  runBy: string
}

const rows: ReconciliationRow[] = [
  { name: 'June Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_June.csv', fileB: 'Bank_Statement_June.csv', date: 'Jun 30, 2026', time: '10:27 AM', matchRate: 98.64, breakValue: '$312,450.75', status: 'Completed', runBy: 'Ousainou J.' },
  { name: 'May Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_May.csv', fileB: 'Bank_Statement_May.csv', date: 'May 31, 2026', time: '09:15 AM', matchRate: 97.18, breakValue: '$421,830.20', status: 'Completed', runBy: 'Amie J.' },
  { name: 'Q2 Supplier Reconciliation', tag: 'Supplier', fileA: 'AP_Ledger_Q2.csv', fileB: 'Supplier_Statement_Q2.csv', date: 'May 30, 2026', time: '04:42 PM', matchRate: 96.02, breakValue: '$856,210.10', status: 'Completed', runBy: 'Ousainou J.' },
  { name: 'April Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_April.csv', fileB: 'Bank_Statement_April.csv', date: 'Apr 30, 2026', time: '11:03 AM', matchRate: 97.81, breakValue: '$204,340.60', status: 'Completed', runBy: 'Fatou S.' },
  { name: 'March Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_Mar.csv', fileB: 'Bank_Statement_Mar.csv', date: 'Mar 31, 2026', time: '10:11 AM', matchRate: 99.12, breakValue: '$118,230.40', status: 'Completed', runBy: 'Amie J.' },
  { name: 'Q1 Supplier Reconciliation', tag: 'Supplier', fileA: 'AP_Ledger_Q1.csv', fileB: 'Supplier_Statement_Q1.csv', date: 'Mar 30, 2026', time: '03:21 PM', matchRate: 95.33, breakValue: '$912,340.00', status: 'Completed', runBy: 'Ousainou J.' },
  { name: 'February Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_Feb.csv', fileB: 'Bank_Statement_Feb.csv', date: 'Feb 28, 2026', time: '10:45 AM', matchRate: 97.05, breakValue: '$275,160.90', status: 'Completed', runBy: 'Fatou S.' },
  { name: 'January Bank Reconciliation', tag: 'Bank', fileA: 'Internal_Ledger_Jan.csv', fileB: 'Bank_Statement_Jan.csv', date: 'Jan 31, 2026', time: '09:22 AM', matchRate: 96.88, breakValue: '$193,120.80', status: 'Completed', runBy: 'Amie J.' },
  { name: 'Year End Reconciliation 2025', tag: 'Year End', fileA: 'GL_2025_Final.csv', fileB: 'Bank_2025_Final.csv', date: 'Jan 05, 2026', time: '02:16 PM', matchRate: 92.14, breakValue: '$2,143,025.50', status: 'Completed with Issues', runBy: 'Ousainou J.' },
]

const tagStyles: Record<Tag, string> = {
  Bank: 'bg-indigo-500/15 text-indigo-300',
  Supplier: 'bg-sky-500/15 text-sky-300',
  'Year End': 'bg-violet-500/15 text-violet-300',
}

const statusStyles: Record<Status, string> = {
  Completed: 'bg-emerald-500/15 text-emerald-400',
  'Completed with Issues': 'bg-amber-500/15 text-amber-400',
}

const runByAvatars: Record<string, { src?: string; initials?: string; bg?: string }> = {
  'Ousainou J.': { src: '/ousainou.jpg' },
  'Amie J.': { initials: 'AJ', bg: 'bg-teal-500' },
  'Fatou S.': { initials: 'FS', bg: 'bg-amber-500' },
}

const pageSize = 8
const totalRows = 128
const totalPages = Math.ceil(totalRows / pageSize)
const pageItems: (number | '...')[] = [1, 2, 3, '...', totalPages]

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#232D47] bg-[#0D152A] checked:border-[#1CEAEA] checked:bg-[#1CEAEA]"
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-[#050F20] opacity-0 peer-checked:opacity-100" />
    </span>
  )
}

function RunByAvatar({ name }: { name: string }) {
  const config = runByAvatars[name]

  if (config?.src) {
    return <Image src={config.src} alt={name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  }

  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${config?.bg ?? 'bg-slate-500'}`}>
      {config?.initials ?? name.slice(0, 2).toUpperCase()}
    </span>
  )
}

export default function HistoryTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [favorited, setFavorited] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const startIndex = (currentPage - 1) * pageSize
  const visibleRows = rows.slice(startIndex, startIndex + pageSize)

  const allSelected = selected.size === rows.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.name)))
  }

  const toggleRow = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleFavorite = (name: string) => {
    setFavorited((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search by name, file, reference, or notes..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
          Jun 01, 2026 - Jun 30, 2026
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="w-8 pb-3 pr-3">
                  <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel="Select all" />
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reconciliation Name</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">File Pair</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">
                  <span className="flex items-center gap-1">
                    Date &amp; Time
                    <ChevronsUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Match Rate</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Break Value</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Run By</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.name} className="border-t border-[#1B2540]">
                  <td className="py-3 pr-3 align-top">
                    <Checkbox checked={selected.has(row.name)} onChange={() => toggleRow(row.name)} ariaLabel={`Select ${row.name}`} />
                  </td>
                  <td className="max-w-56 py-3 pr-4 align-top">
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        aria-label="Toggle favorite"
                        onClick={() => toggleFavorite(row.name)}
                        className="mt-0.5 shrink-0 cursor-pointer text-slate-500 hover:text-amber-300"
                      >
                        <Star className={`h-4 w-4 ${favorited.has(row.name) ? 'fill-amber-300 text-amber-300' : ''}`} />
                      </button>
                      <div className="min-w-0">
                        <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={row.name}>
                          {row.name}
                        </TruncateTooltip>
                        <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${tagStyles[row.tag]}`}>
                          {row.tag}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-48 py-3 pr-4 align-top">
                    <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={row.fileA}>
                      {row.fileA}
                    </TruncateTooltip>
                    <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={`vs ${row.fileB}`}>
                      <span className="text-slate-500">vs</span> {row.fileB}
                    </TruncateTooltip>
                  </td>
                  <td className="py-3 pr-4 align-top text-nowrap">
                    <p className="text-slate-200">{row.date}</p>
                    <p className="text-xs text-slate-400">{row.time}</p>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <p className="font-semibold text-white">{row.matchRate.toFixed(2)}%</p>
                    <div className="mt-1.5 h-1.5 w-20 rounded-full bg-[#1B2540]">
                      <div
                        className={`h-1.5 rounded-full ${row.matchRate >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${row.matchRate}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 pr-4 align-top text-nowrap font-medium text-rose-400">{row.breakValue}</td>
                  <td className="py-3 pr-4 align-top">
                    <span className={`inline-block text-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <div className="flex items-center gap-2">
                      <RunByAvatar name={row.runBy} />
                      <span className="text-nowrap text-slate-200">{row.runBy}</span>
                    </div>
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button type="button" aria-label="More actions" className="cursor-pointer hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, rows.length)} of {totalRows} reconciliations
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageItems.map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                    currentPage === page ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
          >
            8 / page
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
