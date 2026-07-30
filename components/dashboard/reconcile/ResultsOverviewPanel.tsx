'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaChartSkeleton } from '@/components/ui/chart-skeletons'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useFilePairTrend, useTransactions } from '@/lib/hooks/useReports'
import { formatCurrency, formatNumber } from '@/lib/format'
import { EmptySuccessState } from './EmptyStates'
import type { ReportDetail } from '@/types/reports'
import type { GoToExplorerOptions } from './TransactionExplorerBoard'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Keys must match matchingEngine.js's BREAK_REASON_TYPE_LABELS exactly
// ('Missing in Counterparty'/'Missing in Internal', no suffix) — not the
// longer category labels break-breakdown uses for the same underlying
// reasons.
const TYPE_COLOR: Record<string, string> = {
  'Amount Mismatch': 'bg-red-500/15 text-red-400',
  'Missing in Counterparty': 'bg-amber-600/20 text-amber-400',
  'Missing in Internal': 'bg-sky-500/15 text-sky-400',
  'Date Mismatch': 'bg-purple-500/15 text-purple-300',
  Duplicate: 'bg-indigo-500/15 text-indigo-300',
}

// Run-indexed, not calendar-day-indexed — see getFilePairTrend's comment.
// `current`/`prior` can be shorter than 7 (or empty) when fewer runs exist
// yet, so the label count always matches whatever `current` actually has.
function runLabels(count: number) {
  return Array.from({ length: count }, (_, i) => `Run ${i + 1}`)
}

function ReconciliationOverviewCard({ report, reportId }: { report: ReportDetail; reportId: string }) {
  const { data: trend, isLoading } = useFilePairTrend(reportId)

  const unmatchedTotal = report.unmatchedCount + report.mismatchedCount
  const donutSegments = [
    { label: 'Matched', value: report.matchedCount, color: '#34D399' },
    { label: 'Unmatched', value: unmatchedTotal, color: '#FB923C' },
    { label: 'Duplicates', value: report.duplicateCount, color: '#A78BFA' },
  ]
  const total = donutSegments.reduce((sum, s) => sum + s.value, 0)

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: donutSegments.map((s) => s.label),
    colors: donutSegments.map((s) => s.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '72%' } } },
    tooltip: { theme: 'dark' },
  }

  const chartDays = runLabels(trend?.matchRateTrend.current.length ?? 0)
  const matchRateTrendOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#34D399', '#818CF8'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4, strokeColors: '#0E182D', strokeWidth: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: '#232D47', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    legend: { show: false },
    xaxis: { categories: chartDays, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94A3B8' } } },
    yaxis: { min: 0, max: 100, tickAmount: 4, labels: { formatter: (value) => `${value}%`, style: { colors: '#94A3B8' } } },
    tooltip: { theme: 'dark', y: { formatter: (value) => `${value}%` } },
  }
  const matchRateTrendSeries = trend
    ? [
        { name: 'Match Rate', data: trend.matchRateTrend.current },
        { name: 'Prior Match Rate', data: trend.matchRateTrend.prior },
      ]
    : []

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Reconciliation Overview</h3>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-400">Match Rate Over Time</p>
          <span className="rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300">
            Last 7 Runs
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-62 shrink-0">
            <Chart options={donutOptions} series={donutSegments.map((s) => s.value)} type="donut" height={210} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xs text-slate-400">Transactions</p>
              <p className="mt-1 text-xl font-bold text-white">{formatNumber(report.totalRows)}</p>
            </div>
          </div>

          <ul className="space-y-3">
            {donutSegments.map((seg) => (
              <li key={seg.label} className="flex items-start gap-2">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                <div>
                  <p className="text-sm font-medium text-white">{seg.label}</p>
                  <p className="text-xs text-slate-400 text-nowrap">
                    {formatNumber(seg.value)} ({total > 0 ? ((seg.value / total) * 100).toFixed(2) : '0.00'}%)
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden self-stretch border-l border-[#232D47] lg:block" />

        <div className="w-full flex-1">
          {isLoading || !trend ? (
            <div className="h-65 w-full">
              <AreaChartSkeleton />
            </div>
          ) : (
            <Chart options={matchRateTrendOptions} series={matchRateTrendSeries} type="area" height={260} />
          )}
        </div>
      </div>
    </div>
  )
}

const UNMATCHED_PAGE_SIZE = 5

function UnmatchedTransactionsTable({ reportId, onGoToExplorer }: { reportId: string; onGoToExplorer?: (opts?: GoToExplorerOptions) => void }) {
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(1)
  const { data, isLoading } = useTransactions(reportId, {
    status: 'unmatched',
    limit: UNMATCHED_PAGE_SIZE,
    offset: (page - 1) * UNMATCHED_PAGE_SIZE,
  })
  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / UNMATCHED_PAGE_SIZE))

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">
          Unmatched Transactions {!showAll && <span className="text-sm font-normal text-slate-400">(Sample)</span>}
        </h3>
        <button
          type="button"
          onClick={() => onGoToExplorer?.({ filter: 'unmatched' })}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="mt-4 w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-3 pr-4 text-nowrap font-semibold">Type</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Reference</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Date</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Description</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Amount</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Reason</th>
              <th className="pb-3 text-nowrap font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || !data ? (
              [0, 1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-t border-[#1B2540]">
                  <td className="py-3 pr-4"><Skeleton className="h-5 w-28 rounded-md" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-20" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-16" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-32" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-16" /></td>
                  <td className="py-3 pr-4"><Skeleton className="h-3 w-32" /></td>
                  <td className="py-3"><Skeleton className="h-4 w-10" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptySuccessState title="No unmatched transactions" subtitle="Every transaction found its match." />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#1B2540]">
                  <td className="py-3 pr-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium text-nowrap ${TYPE_COLOR[row.type] ?? 'bg-slate-500/15 text-slate-300'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-nowrap text-slate-300">{row.reference}</td>
                  <td className="py-3 pr-4 text-nowrap text-slate-300">{row.date ? new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td className="max-w-48 py-3 pr-4">
                    <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={row.description || '—'}>
                      {row.description || '—'}
                    </TruncateTooltip>
                  </td>
                  <td className="py-3 pr-4 text-nowrap text-slate-200">{formatCurrency(row.ledgerAmount ?? row.counterpartyAmount)}</td>
                  <td className="py-3 pr-4 text-nowrap text-slate-400">{row.reason}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button
                        type="button"
                        aria-label="View"
                        onClick={() => onGoToExplorer?.({ rowId: row.id })}
                        className={`cursor-pointer hover:text-white ${row.reviewed ? 'text-emerald-400' : ''}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="border-t border-[#232D47] mt-1 pt-3">
        {showAll ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing {total === 0 ? 0 : (page - 1) * UNMATCHED_PAGE_SIZE + 1} to {Math.min(page * UNMATCHED_PAGE_SIZE, total)} of{' '}
              {formatNumber(total)}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer rounded-md border border-[#232D47] p-1.5 text-slate-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(0, 10)
                .map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
                      page === p ? 'border-[#1CEAEA] text-[#1CEAEA]' : 'border-[#232D47] text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="cursor-pointer rounded-md border border-[#232D47] p-1.5 text-slate-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-400 hover:underline"
          >
            View all unmatched transactions
            <span aria-hidden>&rarr;</span>
          </button>
        )}
      </div>
    </div>
  )
}

type ResultsOverviewPanelProps = {
  reportId: string
  report: ReportDetail
  onGoToExplorer?: (opts?: GoToExplorerOptions) => void
}

export default function ResultsOverviewPanel({ reportId, report, onGoToExplorer }: ResultsOverviewPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <ReconciliationOverviewCard report={report} reportId={reportId} />
      <UnmatchedTransactionsTable reportId={reportId} onGoToExplorer={onGoToExplorer} />
    </div>
  )
}
