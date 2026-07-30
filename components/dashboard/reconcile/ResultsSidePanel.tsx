'use client'

import Image from 'next/image'
import { ChevronDown, Download, FileSpreadsheet, Table2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useBreakBreakdown } from '@/lib/hooks/useReports'
import { formatCurrency, formatDateTime, formatFileSize, formatNumber, formatPercent } from '@/lib/format'
import { BREAK_CATEGORY_STYLE } from '@/lib/breakCategories'
import { EmptySuccessState } from './EmptyStates'
import type { ReportDetail } from '@/types/reports'

type ResultsSidePanelProps = {
  reportId: string
  report: ReportDetail
  onGoToExplorer?: () => void
}

export default function ResultsSidePanel({ reportId, report, onGoToExplorer }: ResultsSidePanelProps) {
  const { data: breakdown, isLoading } = useBreakBreakdown(reportId)
  const maxAmount = Math.max(1, ...(breakdown ?? []).map((b) => b.amount))

  const fileSummary = [
    { title: 'Internal Ledger', filename: report.fileAName, accent: '#04E2B8', summary: report.fileASummary },
    { title: 'Counterparty File', filename: report.fileBName, accent: '#9366DE', summary: report.fileBSummary },
  ]

  return (
    <ScrollArea className="h-191 w-full min-w-0 pr-3">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <TruncateTooltip as="h3" className="truncate text-lg font-semibold text-white" tooltip="Breakdown by Category (Top 5)">
              Breakdown by Category <span className="text-sm font-normal text-slate-400">(Top 5)</span>
            </TruncateTooltip>
            <TruncateTooltip
              as="button"
              type="button"
              className="flex truncate cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
              tooltip="View All"
            >
              View All
              <ChevronDown className="h-3.5 w-3.5" />
            </TruncateTooltip>
          </div>

          {isLoading || !breakdown ? (
            <ul className="mt-4 space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </li>
              ))}
            </ul>
          ) : breakdown.length === 0 ? (
            <EmptySuccessState title="No breaks to categorize" subtitle="Every transaction matched cleanly." />
          ) : (
            <ul className="mt-4 space-y-4">
              {breakdown.slice(0, 5).map((item) => {
                const style = BREAK_CATEGORY_STYLE[item.category] ?? BREAK_CATEGORY_STYLE.Others
                const width = (item.amount / maxAmount) * 100
                return (
                  <li key={item.category} className="flex items-center gap-3">
                    <Image src={style.icon} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <TruncateTooltip as="p" className="truncate text-sm text-slate-200" tooltip={item.category}>
                          {item.category}
                        </TruncateTooltip>
                        <p className="shrink-0 text-sm font-medium text-white">{formatCurrency(item.amount)}</p>
                      </div>
                      <div className="mt-2 h-1 w-full rounded-full bg-[#1B2540]">
                        <div className="h-1 rounded-full" style={{ width: `${width}%`, backgroundColor: style.color }} />
                      </div>
                    </div>
                    <p className="w-14 shrink-0 text-right text-sm text-slate-400">{formatPercent(item.percent, 2)}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">File Summary</h3>
          </div>

          <div className="mt-4 grid grid-cols-1 divide-y divide-[#232D47] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {fileSummary.map((file) => (
              <div key={file.title} className="pt-4 first:pt-0 sm:pt-0 sm:pr-4 sm:last:pr-0 sm:last:pl-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${file.accent}26`, color: file.accent }}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip={file.title}>
                      {file.title}
                    </TruncateTooltip>
                    <TruncateTooltip as="p" className="truncate text-xs text-slate-400" tooltip={file.filename ?? '—'}>
                      {file.filename ?? '—'}
                    </TruncateTooltip>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rows</span>
                    <span className="font-medium text-slate-200">{file.summary ? formatNumber(file.summary.rows) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Columns</span>
                    <span className="font-medium text-slate-200">{file.summary ? formatNumber(file.summary.columns) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">File Size</span>
                    <span className="font-medium text-slate-200">{file.summary ? formatFileSize(file.summary.fileSizeBytes) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400">Imported</span>
                    <TruncateTooltip as="span" className="truncate font-medium text-slate-200" tooltip={formatDateTime(report.runDate)}>
                      {formatDateTime(report.runDate)}
                    </TruncateTooltip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Processed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#232D47] bg-[#0E182D] p-4">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onGoToExplorer}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-500/15">
                <Image src="/icons/unmatched.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="View Unmatched">
                  View Unmatched
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Review all unmatched items">
                  Review all unmatched items
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              onClick={onGoToExplorer}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-500/15">
                <Image src="/icons/duplicates.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="View Duplicates">
                  View Duplicates
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Review duplicate records">
                  Review duplicate records
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              onClick={onGoToExplorer}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Table2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="Transaction Explorer">
                  Transaction Explorer
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Drill down to transaction level">
                  Drill down to transaction level
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#232D47] p-4 text-left hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                <Download className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-white" tooltip="Export Results">
                  Export Results
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-slate-400" tooltip="Download in multiple formats">
                  Download in multiple formats
                </TruncateTooltip>
              </div>
            </button>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
