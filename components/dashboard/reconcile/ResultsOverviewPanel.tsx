'use client'

import dynamic from 'next/dynamic'
import { ChevronDown, Eye, MoreVertical } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const donutSegments = [
  { label: 'Matched', value: 98243, percent: '98.64%', color: '#34D399' },
  { label: 'Unmatched', value: 1412, percent: '1.42%', color: '#FB923C' },
  { label: 'Duplicates', value: 17, percent: '0.02%', color: '#A78BFA' },
]

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

const chartDays = ['Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30']

const matchRateTrendSeries = [
  { name: 'Match Rate', data: [94.2, 95.6, 94.9, 96.5, 96.3, 97.8, 98.64] },
  { name: 'Prior Match Rate', data: [92.4, 93.7, 93.3, 94.7, 94.5, 96.1, 96.6] },
]

const matchRateTrendOptions: ApexOptions = {
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#34D399', '#818CF8'],
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
    min: 92,
    max: 100,
    tickAmount: 4,
    labels: { formatter: (value) => `${value}%`, style: { colors: '#94A3B8' } },
  },
  tooltip: { theme: 'dark', y: { formatter: (value) => `${value}%` } },
}

const unmatchedTransactions = [
  {
    type: 'Missing in Counterparty',
    typeColor: 'bg-amber-600/20 text-amber-400',
    reference: 'TRX-0001258',
    date: 'Jun 30, 2026',
    description: 'Payment to ABC Supplies',
    amount: '$12,450.00',
    reason: 'Not found in counterparty file',
  },
  {
    type: 'Amount Mismatch',
    typeColor: 'bg-red-500/15 text-red-400',
    reference: 'TRX-0000987',
    date: 'Jun 29, 2026',
    description: 'Invoice INV-20492',
    amount: '$2,340.00',
    reason: 'Amount variance $10.00',
  },
  {
    type: 'Missing in Internal',
    typeColor: 'bg-sky-500/15 text-sky-400',
    reference: 'REF-009856',
    date: 'Jun 29, 2026',
    description: 'Bank Charge',
    amount: '$350.00',
    reason: 'Not found in internal ledger',
  },
  {
    type: 'Date Mismatch',
    typeColor: 'bg-purple-500/15 text-purple-300',
    reference: 'TRX-0001122',
    date: 'Jun 28, 2026',
    description: 'Customer Payment',
    amount: '$5,640.00',
    reason: 'Date variance (1 day)',
  },
  {
    type: 'Duplicate',
    typeColor: 'bg-indigo-500/15 text-indigo-300',
    reference: 'TRX-0001456',
    date: 'Jun 27, 2026',
    description: 'Payment from XYZ Ltd',
    amount: '$1,200.00',
    reason: 'Duplicate reference',
  },
]

function ReconciliationOverviewCard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Reconciliation Overview</h3>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate-400">Match Rate Over Time</p>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            Last 7 Runs
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-62 shrink-0">
            <Chart options={donutOptions} series={donutSegments.map((s) => s.value)} type="donut" height={210} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-xs text-slate-400">Transactions</p>
              <p className="mt-1 text-xl font-bold text-white">99,672</p>
            </div>
          </div>

          <ul className="space-y-3">
            {donutSegments.map((seg) => (
              <li key={seg.label} className="flex items-start gap-2">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
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

        <div className="hidden self-stretch border-l border-[#232D47] lg:block" />

        <div className="w-full flex-1">
          <Chart options={matchRateTrendOptions} series={matchRateTrendSeries} type="area" height={260} />
        </div>
      </div>
    </div>
  )
}

function UnmatchedTransactionsTable() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">
          Unmatched Transactions <span className="text-sm font-normal text-slate-400">(Sample)</span>
        </h3>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
        >
          View All (1,412)
          <ChevronDown className="h-3.5 w-3.5" />
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
            {unmatchedTransactions.map((row) => (
              <tr key={row.reference} className="border-t border-[#1B2540]">
                <td className="py-3 pr-4">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium text-nowrap ${row.typeColor}`}>
                    {row.type}
                  </span>
                </td>
                <td className="py-3 pr-4 text-nowrap text-slate-300">{row.reference}</td>
                <td className="py-3 pr-4 text-nowrap text-slate-300">{row.date}</td>
                <td className="py-3 pr-4 text-nowrap text-slate-300">{row.description}</td>
                <td className="py-3 pr-4 text-nowrap text-slate-200">{row.amount}</td>
                <td className="py-3 pr-4 text-nowrap text-slate-400">{row.reason}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3 text-slate-400">
                    <button type="button" aria-label="View" className="cursor-pointer hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="More options" className="cursor-pointer hover:text-white">
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
      <div className='border-t border-[#232D47] mt-1 pt-3'>
      <button type="button" className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-sky-400 hover:underline">
        View all unmatched transactions
        <span aria-hidden>&rarr;</span>
      </button>
      </div>
    </div>
  )
}

export default function ResultsOverviewPanel() {
  return (
    <div className="flex flex-col gap-6">
      <ReconciliationOverviewCard />
      <UnmatchedTransactionsTable />
    </div>
  )
}
