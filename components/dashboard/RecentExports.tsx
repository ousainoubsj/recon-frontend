'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, MoreVertical, Search } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Format = 'PDF' | 'Excel'

type ExportRow = {
  name: string
  iconClassName: string
  reconciliation: string
  generatedBy: string
  date: string
  time: string
  format: Format
  size: string
}

const rows: ExportRow[] = [
  { name: 'June Bank Reconciliation - Summary', iconClassName: 'text-indigo-400', reconciliation: 'June Bank Reconciliation', generatedBy: 'Ousainou J.', date: 'Jun 30, 2026', time: '10:28 AM', format: 'PDF', size: '1.24 MB' },
  { name: 'June Bank Reconciliation - Unmatched', iconClassName: 'text-emerald-400', reconciliation: 'June Bank Reconciliation', generatedBy: 'Ousainou J.', date: 'Jun 30, 2026', time: '10:28 AM', format: 'Excel', size: '2.18 MB' },
  { name: 'June Bank Reconciliation - Details', iconClassName: 'text-amber-400', reconciliation: 'June Bank Reconciliation', generatedBy: 'Amie J.', date: 'Jun 30, 2026', time: '10:20 AM', format: 'Excel', size: '4.75 MB' },
  { name: 'May Bank Reconciliation - Summary', iconClassName: 'text-rose-400', reconciliation: 'May Bank Reconciliation', generatedBy: 'Fatou S.', date: 'May 31, 2026', time: '09:18 AM', format: 'PDF', size: '1.12 MB' },
  { name: 'Q2 Supplier Reconciliation - Report', iconClassName: 'text-rose-400', reconciliation: 'Q2 Supplier Reconciliation', generatedBy: 'Ousainou J.', date: 'May 30, 2026', time: '04:50 PM', format: 'PDF', size: '1.89 MB' },
  { name: 'April Bank Reconciliation - Unmatched', iconClassName: 'text-emerald-400', reconciliation: 'April Bank Reconciliation', generatedBy: 'Amie J.', date: 'Apr 30, 2026', time: '11:10 AM', format: 'Excel', size: '2.01 MB' },
  { name: 'March Bank Reconciliation - Summary', iconClassName: 'text-rose-400', reconciliation: 'March Bank Reconciliation', generatedBy: 'Fatou S.', date: 'Mar 31, 2026', time: '10:15 AM', format: 'PDF', size: '1.08 MB' },
  { name: 'February Bank Reconciliation - Details', iconClassName: 'text-amber-400', reconciliation: 'February Bank Reconciliation', generatedBy: 'Ousainou J.', date: 'Feb 28, 2026', time: '09:45 AM', format: 'Excel', size: '3.42 MB' },
]

const formatStyles: Record<Format, string> = {
  PDF: 'bg-rose-500/15 text-rose-400',
  Excel: 'bg-emerald-500/15 text-emerald-400',
}

const runByAvatars: Record<string, { src?: string; initials?: string; bg?: string }> = {
  'Ousainou J.': { src: '/ousainou.jpg' },
  'Amie J.': { initials: 'AJ', bg: 'bg-teal-500' },
  'Fatou S.': { initials: 'FS', bg: 'bg-amber-500' },
}

const pageSize = 8
const totalRows = 23
const totalPages = Math.ceil(totalRows / pageSize)
const pageItems: (number | '...')[] =
  totalPages <= 5 ? Array.from({ length: totalPages }, (_, index) => index + 1) : [1, 2, 3, '...', totalPages]

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

export default function RecentExports() {
  const [currentPage, setCurrentPage] = useState(1)

  const startIndex = (currentPage - 1) * pageSize
  const visibleRows = rows.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white">Recent Exports</h3>
        <p className="mt-1 text-sm text-slate-400">Your recently generated and downloaded reports.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search by report name or reconciliation..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

      </div>

      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4 text-nowrap font-semibold">Report Name</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reconciliation</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Generated By</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Date &amp; Time</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Format</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Size</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.name} className="border-t border-[#1B2540]">
                  <td className="max-w-56 py-3 pr-4 align-top">
                    <div className="flex items-center gap-2">
                      <FileText className={`h-5 w-5 shrink-0 ${row.iconClassName}`} />
                      <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={row.name}>
                        {row.name}
                      </TruncateTooltip>
                    </div>
                  </td>
                  <td className="max-w-40 py-3 pr-4 align-top">
                    <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={row.reconciliation}>
                      {row.reconciliation}
                    </TruncateTooltip>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <div className="flex items-center gap-2">
                      <RunByAvatar name={row.generatedBy} />
                      <span className="text-nowrap text-slate-200">{row.generatedBy}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 align-top text-nowrap">
                    <p className="text-slate-200">{row.date}</p>
                    <p className="text-xs text-slate-400">{row.time}</p>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${formatStyles[row.format]}`}>
                      {row.format}
                    </span>
                  </td>
                  <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.size}</td>
                  <td className="py-3 pr-4 align-top">
                    <span className="flex items-center gap-1 text-nowrap font-medium text-emerald-400">
                      Completed
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button type="button" aria-label="Download" className="cursor-pointer hover:text-white">
                        <Download className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="More actions" className="cursor-pointer hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, rows.length)} of {totalRows} exports
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
