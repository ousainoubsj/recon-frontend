'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleDot,
  Clock,
  Eye,
  Search,
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBreakBreakdown, useFilePairTrend, useReport, useTransactions } from '@/lib/hooks/useReports'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { BREAK_CATEGORY_STYLE } from '@/lib/breakCategories'
import { EmptySuccessState, EmptyTransactions } from './EmptyStates'
import type { TransactionRowStatus } from '@/types/reports'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type FilterKey = 'all' | 'matched' | 'unmatched' | 'duplicates' | 'breakValue'
type StatusFilterValue = 'matched' | 'mismatched' | 'unmatched' | 'duplicate' | undefined

const statusConfig: Record<TransactionRowStatus, { Icon: typeof CheckCircle2; className: string }> = {
  Matched: { Icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-400' },
  Unmatched: { Icon: CircleDot, className: 'bg-amber-500/15 text-amber-400' },
  Duplicate: { Icon: CircleDot, className: 'bg-violet-500/15 text-violet-400' },
  Mismatched: { Icon: CircleDot, className: 'bg-rose-500/15 text-rose-400' },
}

function last7DayLabels() {
  const labels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
  }
  return labels
}

const PAGE_SIZE = 5

type TransactionExplorerBoardProps = {
  reportId: string
  selectedRowId?: string
  onSelectRow: (rowId: string) => void
}

export default function TransactionExplorerBoard({ reportId, onSelectRow }: TransactionExplorerBoardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [q, setQ] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  const { data: report } = useReport(reportId)

  const statusFilter: StatusFilterValue =
    activeFilter === 'matched' ? 'matched' : activeFilter === 'unmatched' ? 'unmatched' : activeFilter === 'duplicates' ? 'duplicate' : undefined

  const { data, isLoading } = useTransactions(reportId, {
    search: q.trim() || undefined,
    status: statusFilter,
    amountMin: amountMin ? Number(amountMin) : undefined,
    amountMax: amountMax ? Number(amountMax) : undefined,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    sortBy: 'date',
    sortDir,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  const { data: breakdown, isLoading: isBreakdownLoading } = useBreakBreakdown(reportId)
  const { data: trend, isLoading: isTrendLoading } = useFilePairTrend(reportId)

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const resetToFirstPage = () => setPage(1)

  const statCards: { key: FilterKey; label: string; value: string; percent?: string; labelColor: string; valueColor: string; clickable: boolean }[] = report
    ? [
        { key: 'all', label: 'All Transactions', value: formatNumber(report.totalRows), labelColor: 'text-sky-400', valueColor: 'text-white', clickable: true },
        {
          key: 'matched',
          label: 'Matched',
          value: formatNumber(report.matchedCount),
          percent: formatPercent(report.totalRows > 0 ? (report.matchedCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-emerald-400',
          valueColor: 'text-white',
          clickable: true,
        },
        {
          key: 'unmatched',
          label: 'Unmatched',
          value: formatNumber(report.unmatchedCount),
          percent: formatPercent(report.totalRows > 0 ? (report.unmatchedCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-amber-400',
          valueColor: 'text-white',
          clickable: true,
        },
        {
          key: 'duplicates',
          label: 'Duplicates',
          value: formatNumber(report.duplicateCount),
          percent: formatPercent(report.totalRows > 0 ? (report.duplicateCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-violet-400',
          valueColor: 'text-white',
          clickable: true,
        },
        // Not a real status filter server-side — display-only, per explicit decision.
        { key: 'breakValue', label: 'Break Value', value: formatCurrency(report.totalBreakValue), labelColor: 'text-rose-400', valueColor: 'text-rose-400', clickable: false },
      ]
    : []

  const matchStatusSegments = report
    ? [
        { label: 'Matched', value: report.matchedCount, color: '#34D399' },
        { label: 'Unmatched', value: report.unmatchedCount, color: '#FB923C' },
        { label: 'Mismatched', value: report.mismatchedCount, color: '#FB7185' },
        { label: 'Duplicates', value: report.duplicateCount, color: '#A78BFA' },
      ]
    : []
  const matchStatusTotal = matchStatusSegments.reduce((sum, s) => sum + s.value, 0)
  const matchStatusOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: matchStatusSegments.map((s) => s.label),
    colors: matchStatusSegments.map((s) => s.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '72%' } } },
    tooltip: { theme: 'dark' },
  }

  const chartDays = last7DayLabels()
  const breakValueTrendSeries = trend ? [{ name: 'Break Value', data: trend.breakValueTrend.current }] : []
  const breakValueTrendOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#34D399'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4, strokeColors: '#0E182D', strokeWidth: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: '#232D47', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    legend: { show: false },
    xaxis: { categories: chartDays, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: '#94A3B8' } } },
    yaxis: { min: 0, tickAmount: 4, labels: { formatter: (value) => `$${Math.round(value / 1000)}K`, style: { colors: '#94A3B8' } } },
    tooltip: { theme: 'dark', y: { formatter: (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` } },
  }

  const maxBreakAmount = Math.max(1, ...(breakdown ?? []).map((b) => b.amount))

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Explorer</h1>
          <p className="mt-1 text-sm text-slate-400">Drill down and review transactions in detail. Use filters to find specific records.</p>
        </div>
        <Button
          render={<Link href="/dashboard/history" />}
          className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
        >
          <Clock className="h-4 w-4" />
          History
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            disabled={!card.clickable}
            onClick={() => {
              if (!card.clickable) return
              setActiveFilter(card.key)
              resetToFirstPage()
            }}
            className={`rounded-xl border p-3 text-left transition-colors ${card.clickable ? 'cursor-pointer' : 'cursor-default'} ${
              activeFilter === card.key && card.clickable ? 'border-sky-500 bg-sky-500/10' : 'border-[#232D47] bg-[#0E182D]/40 hover:bg-white/5'
            }`}
          >
            <p className={`text-sm font-medium ${activeFilter === card.key && card.clickable ? 'text-sky-400' : card.labelColor}`}>{card.label}</p>
            <div className=" flex items-center justify-between gap-2">
              <span className={`text-2xl font-semibold ${card.valueColor}`}>{card.value}</span>
              {card.percent && <span className={`text-sm font-normal ${card.labelColor}`}>{card.percent}</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              resetToFirstPage()
            }}
            placeholder="Search by reference, description, amount..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Match Status</label>
          <Select
            value={statusFilter ?? 'all'}
            onValueChange={(value) => {
              const v = value as StatusFilterValue | 'all'
              setActiveFilter(v === 'all' ? 'all' : v === 'matched' ? 'matched' : v === 'unmatched' ? 'unmatched' : v === 'duplicate' ? 'duplicates' : 'all')
              resetToFirstPage()
            }}
            items={{ all: 'All', matched: 'Matched', mismatched: 'Mismatched', unmatched: 'Unmatched', duplicate: 'Duplicate' }}
          >
            <SelectTrigger className="h-9! w-fit cursor-pointer justify-between gap-6 border-[#232D47] bg-[#0A1128] text-sm text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="mismatched">Mismatched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Amount Range</label>
          <div className="flex items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-1.5 text-sm text-slate-200">
            <input
              type="number"
              value={amountMin}
              onChange={(e) => {
                setAmountMin(e.target.value)
                resetToFirstPage()
              }}
              placeholder="Min"
              className="w-16 bg-transparent placeholder:text-slate-500 focus:outline-none"
            />
            <span className="text-slate-500">-</span>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => {
                setAmountMax(e.target.value)
                resetToFirstPage()
              }}
              placeholder="Max"
              className="w-16 bg-transparent placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Date Range</label>
          <DateRangePicker
            value={dateRange}
            onChange={(value) => {
              setDateRange(value)
              resetToFirstPage()
            }}
          />
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="w-8 pb-3 pr-3">
                  <input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-[#232D47] bg-[#0D152A] accent-[#1CEAEA]" />
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reference</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">
                  <button
                    type="button"
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="flex cursor-pointer items-center gap-1"
                  >
                    Date
                    <ChevronsUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Description</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Ledger Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Counterparty Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Difference</th>
                <th className="pb-3 text-nowrap font-semibold" />
              </tr>
            </thead>
            <tbody>
              {isLoading || !data ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-[#1B2540]">
                    <td className="py-3 pr-3"><Skeleton className="h-4 w-4 rounded" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-20" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-32" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-14" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-4 rounded" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyTransactions />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const { Icon, className } = statusConfig[row.status]
                  return (
                    <tr key={row.id} className="border-t border-[#1B2540]">
                      <td className="py-3 pr-3">
                        <input type="checkbox" className="h-4 w-4 cursor-pointer rounded border-[#232D47] bg-[#0D152A] accent-[#1CEAEA]" />
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-nowrap ${className}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-nowrap text-slate-300">{row.reference}</td>
                      <td className="py-3 pr-4 text-nowrap text-slate-300">
                        {row.date ? new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-nowrap text-slate-300">{row.description || '—'}</td>
                      <td className="py-3 pr-4 text-nowrap text-right text-slate-200">{row.ledgerAmount != null ? formatCurrency(row.ledgerAmount) : '—'}</td>
                      <td className="py-3 pr-4 text-nowrap text-right text-slate-200">{row.counterpartyAmount != null ? formatCurrency(row.counterpartyAmount) : '—'}</td>
                      <td className={`py-3 pr-4 text-nowrap text-right ${row.hasDifference ? 'text-rose-400' : 'text-slate-200'}`}>
                        {row.difference != null ? formatCurrency(row.difference) : '—'}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          aria-label="View details"
                          onClick={() => onSelectRow(row.id)}
                          className="cursor-pointer text-slate-400 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {formatNumber(total)} transactions
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

          <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">
            {PAGE_SIZE} / page
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
        <div className="grid grid-cols-1 divide-y divide-[#232D47] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="pb-6 lg:pb-0 lg:pr-6">
            <h3 className="text-base font-semibold text-white">Breakdown by Match Status</h3>
            <div className="mt-12 flex items-center gap-2">
              <div className="relative w-36 shrink-0">
                <Chart options={matchStatusOptions} series={matchStatusSegments.map((s) => s.value)} type="donut" height={150} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-bold text-white">{formatNumber(matchStatusTotal)}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {matchStatusSegments.map((seg) => (
                  <li key={seg.label} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                    <div>
                      <p className="text-sm font-medium text-white">{seg.label}</p>
                      <p className="text-xs text-slate-400 text-nowrap">
                        {formatNumber(seg.value)} ({matchStatusTotal > 0 ? ((seg.value / matchStatusTotal) * 100).toFixed(2) : '0.00'}%)
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="py-6 lg:py-0 lg:px-6">
            <h3 className="text-base font-semibold text-white">Break Value Trend</h3>
            <div className="mt-2">
              {isTrendLoading || !trend ? (
                <Skeleton className="h-55 w-full" />
              ) : (
                <Chart options={breakValueTrendOptions} series={breakValueTrendSeries} type="area" height={220} />
              )}
            </div>
          </div>

          <div className="pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-base font-semibold text-white">Top Break Causes</h3>
            {isBreakdownLoading || !breakdown ? (
              <ul className="mt-4 space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </li>
                ))}
              </ul>
            ) : breakdown.length === 0 ? (
              <EmptySuccessState title="No breaks to categorize" subtitle="Every transaction matched cleanly." />
            ) : (
              <ul className="mt-4 space-y-4">
                {breakdown.slice(0, 5).map((item) => {
                  const style = BREAK_CATEGORY_STYLE[item.category] ?? BREAK_CATEGORY_STYLE.Others
                  return (
                    <li key={item.category}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <TruncateTooltip as="span" className="truncate text-slate-300" tooltip={item.category}>
                          {item.category}
                        </TruncateTooltip>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="font-medium text-white">{formatCurrency(item.amount)}</span>
                          <span className="w-14 text-right text-slate-400">{formatPercent(item.percent, 2)}</span>
                        </span>
                      </div>
                      <div className="mt-2 h-1 w-full rounded-full bg-[#1B2540]">
                        <div className="h-1 rounded-full" style={{ width: `${(item.amount / maxBreakAmount) * 100}%`, backgroundColor: style.color }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
