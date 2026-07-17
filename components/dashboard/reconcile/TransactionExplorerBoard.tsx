'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  CalendarDays,
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
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type FilterKey = 'all' | 'matched' | 'unmatched' | 'duplicates' | 'breakValue'

const statCards: {
  key: FilterKey
  label: string
  value: string
  percent?: string
  labelColor: string
  valueColor: string
}[] = [
  { key: 'all', label: 'All Transactions', value: '99,672', labelColor: 'text-sky-400', valueColor: 'text-white' },
  { key: 'matched', label: 'Matched', value: '98,243', percent: '98.64%', labelColor: 'text-emerald-400', valueColor: 'text-white' },
  { key: 'unmatched', label: 'Unmatched', value: '1,412', percent: '1.42%', labelColor: 'text-amber-400', valueColor: 'text-white' },
  { key: 'duplicates', label: 'Duplicates', value: '17', percent: '0.02%', labelColor: 'text-violet-400', valueColor: 'text-white' },
  { key: 'breakValue', label: 'Break Value', value: '$312,450.75', labelColor: 'text-rose-400', valueColor: 'text-rose-400' },
]

type Status = 'Matched' | 'Unmatched' | 'Duplicate' | 'Mismatched'

const statusConfig: Record<Status, { Icon: typeof CheckCircle2; className: string }> = {
  Matched: { Icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-400' },
  Unmatched: { Icon: CircleDot, className: 'bg-amber-500/15 text-amber-400' },
  Duplicate: { Icon: CircleDot, className: 'bg-violet-500/15 text-violet-400' },
  Mismatched: { Icon: CircleDot, className: 'bg-rose-500/15 text-rose-400' },
}

const transactions: {
  status: Status
  reference: string
  date: string
  description: string
  ledgerAmount: string
  counterpartyAmount: string
  difference: string
  hasDifference: boolean
}[] = [
  { status: 'Matched', reference: 'TRX-0001258', date: 'Jun 30, 2026', description: 'Payment to ABC Supplies', ledgerAmount: '$12,450.00', counterpartyAmount: '$12,450.00', difference: '$0.00', hasDifference: false },
  { status: 'Matched', reference: 'TRX-0001259', date: 'Jun 30, 2026', description: 'Invoice INV-20492', ledgerAmount: '$2,340.00', counterpartyAmount: '$2,340.00', difference: '$0.00', hasDifference: false },
  { status: 'Unmatched', reference: 'TRX-0001260', date: 'Jun 30, 2026', description: 'Bank Charges - June', ledgerAmount: '$350.00', counterpartyAmount: '—', difference: '$350.00', hasDifference: true },
  { status: 'Matched', reference: 'TRX-0001261', date: 'Jun 29, 2026', description: 'Customer Payment', ledgerAmount: '$5,640.00', counterpartyAmount: '$5,640.00', difference: '$0.00', hasDifference: false },
  { status: 'Duplicate', reference: 'TRX-0001262', date: 'Jun 29, 2026', description: 'Payment from XYZ Ltd', ledgerAmount: '$1,200.00', counterpartyAmount: '$1,200.00', difference: '$0.00', hasDifference: false },
  { status: 'Mismatched', reference: 'TRX-0001263', date: 'Jun 28, 2026', description: 'Refund to Customer', ledgerAmount: '$3,100.00', counterpartyAmount: '$3,090.00', difference: '$10.00', hasDifference: true },
  { status: 'Matched', reference: 'TRX-0001264', date: 'Jun 28, 2026', description: 'Salary Payment', ledgerAmount: '$18,750.00', counterpartyAmount: '$18,750.00', difference: '$0.00', hasDifference: false },
  { status: 'Unmatched', reference: 'TRX-0001265', date: 'Jun 27, 2026', description: 'Interest Income', ledgerAmount: '$245.75', counterpartyAmount: '—', difference: '$245.75', hasDifference: true },
]

const matchStatusSegments = [
  { label: 'Matched', value: 98243, percent: '98.64%', color: '#34D399' },
  { label: 'Unmatched', value: 1412, percent: '1.42%', color: '#FB923C' },
  { label: 'Mismatched', value: 312, percent: '0.31%', color: '#FB7185' },
  { label: 'Duplicates', value: 17, percent: '0.02%', color: '#A78BFA' },
]

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

const chartDays = ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30']

const breakValueTrendSeries = [{ name: 'Break Value', data: [120000, 175000, 230000, 190000, 215000, 290000, 312450.75] }]

const breakValueTrendOptions: ApexOptions = {
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#34D399'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  markers: { size: 4, strokeColors: '#0E182D', strokeWidth: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
  },
  grid: { borderColor: '#232D47', strokeDashArray: 4, yaxis: { lines: { show: true } } },
  legend: { show: false },
  xaxis: {
    categories: chartDays,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94A3B8' } },
  },
  yaxis: {
    min: 0,
    max: 400000,
    tickAmount: 4,
    labels: { formatter: (value) => `$${Math.round(value / 1000)}K`, style: { colors: '#94A3B8' } },
  },
  tooltip: { theme: 'dark', y: { formatter: (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` } },
}

const topBreakCauses = [
  { label: 'Amount Mismatch', amount: '$182,450.25', percent: '58.41%', width: 100, color: '#fb7185' },
  { label: 'Missing in Counterparty', amount: '$78,520.10', percent: '25.15%', width: 62, color: '#fb923c' },
  { label: 'Missing in Ledger', amount: '$31,245.60', percent: '10.00%', width: 40, color: '#60a5fa' },
  { label: 'Date Mismatch', amount: '$12,120.30', percent: '3.88%', width: 22, color: '#a78bfa' },
  { label: 'Others', amount: '$8,114.50', percent: '2.56%', width: 16, color: '#34d399' },
]

const pageSize = 5

export default function TransactionExplorerBoard() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(transactions.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const visibleTransactions = transactions.slice(startIndex, startIndex + pageSize)

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
            onClick={() => setActiveFilter(card.key)}
            className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
              activeFilter === card.key ? 'border-sky-500 bg-sky-500/10' : 'border-[#232D47] bg-[#0E182D]/40 hover:bg-white/5'
            }`}
          >
            <p className={`text-sm font-medium ${activeFilter === card.key ? 'text-sky-400' : card.labelColor}`}>{card.label}</p>
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
            placeholder="Search by reference, description, amount..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Match Status</label>
          <button
            type="button"
            className="flex cursor-pointer items-center justify-between gap-6 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            All
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Amount Range</label>
          <div className="flex items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-500">
            <span>Min</span>
            <span>-</span>
            <span>Max</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400">Date Range</label>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
          >
            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
            Jun 01, 2026 - Jun 30, 2026
          </button>
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
                  <span className="flex items-center gap-1">
                    Date
                    <ChevronsUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Description</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Ledger Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Counterparty Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Difference</th>
                <th className="pb-3 text-nowrap font-semibold" />
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.map((row) => {
                const { Icon, className } = statusConfig[row.status]
                return (
                  <tr key={row.reference} className="border-t border-[#1B2540]">
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
                    <td className="py-3 pr-4 text-nowrap text-slate-300">{row.date}</td>
                    <td className="py-3 pr-4 text-nowrap text-slate-300">{row.description}</td>
                    <td className="py-3 pr-4 text-nowrap text-right text-slate-200">{row.ledgerAmount}</td>
                    <td className="py-3 pr-4 text-nowrap text-right text-slate-200">{row.counterpartyAmount}</td>
                    <td className={`py-3 pr-4 text-nowrap text-right ${row.hasDifference ? 'text-rose-400' : 'text-slate-200'}`}>
                      {row.difference}
                    </td>
                    <td className="py-3">
                      <button type="button" aria-label="View details" className="cursor-pointer text-slate-400 hover:text-white">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, transactions.length)} of {transactions.length} transactions
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="cursor-pointer rounded-md border border-[#232D47] p-1.5 text-slate-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
                  currentPage === page ? 'border-[#1CEAEA] text-[#1CEAEA]' : 'border-[#232D47] text-slate-300 hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="cursor-pointer rounded-md border border-[#232D47] p-1.5 text-slate-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">
            {pageSize} / page
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
                  <p className="text-xl font-bold text-white">99,672</p>
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
                        {seg.value.toLocaleString()} ({seg.percent})
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
              <Chart options={breakValueTrendOptions} series={breakValueTrendSeries} type="area" height={220} />
            </div>
          </div>

          <div className="pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-base font-semibold text-white">Top Break Causes</h3>
            <ul className="mt-4 space-y-4">
              {topBreakCauses.map((item) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <TruncateTooltip as="span" className="truncate text-slate-300" tooltip={item.label}>
                      {item.label}
                    </TruncateTooltip>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="font-medium text-white">{item.amount}</span>
                      <span className="w-14 text-right text-slate-400">{item.percent}</span>
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-[#1B2540]">
                    <div className="h-1 rounded-full" style={{ width: `${item.width}%`, backgroundColor: item.color }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
