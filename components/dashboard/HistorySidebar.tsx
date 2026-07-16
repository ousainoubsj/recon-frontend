'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowRight, CheckCircle2, Files, Star, XCircle } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type FilterKey = 'all' | 'completed' | 'issues' | 'failed' | 'favorite'

const quickFilters: {
  key: FilterKey
  label: string
  count: number
  Icon: typeof Files
  iconClassName: string
}[] = [
  { key: 'all', label: 'All Reconciliations', count: 128, Icon: Files, iconClassName: 'text-indigo-300' },
  { key: 'completed', label: 'Completed', count: 118, Icon: CheckCircle2, iconClassName: 'text-emerald-400' },
  { key: 'issues', label: 'Completed with Issues', count: 6, Icon: AlertTriangle, iconClassName: 'text-amber-400' },
  { key: 'failed', label: 'Failed', count: 2, Icon: XCircle, iconClassName: 'text-rose-400' },
  { key: 'favorite', label: 'Favorites', count: 2, Icon: Star, iconClassName: 'text-blue-400' },
]

const matchRateSegments = [
  { label: '≥ 99%', value: 38, percent: '29.7%', color: '#34D399' },
  { label: '95% - 98.99%', value: 62, percent: '48.4%', color: '#2DD4BF' },
  { label: '90% - 94.99%', value: 18, percent: '14.1%', color: '#818CF8' },
  { label: '< 90%', value: 8, percent: '6.3%', color: '#FB923C' },
  { label: 'Failed', value: 2, percent: '1.5%', color: '#FB7185' },
]

const matchRateTotal = matchRateSegments.reduce((sum, seg) => sum + seg.value, 0)

const matchRateOptions: ApexOptions = {
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: matchRateSegments.map((s) => s.label),
  colors: matchRateSegments.map((s) => s.color),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { show: false },
  plotOptions: { pie: { donut: { size: '72%' } } },
  tooltip: { theme: 'dark' },
}

const topFilePairs = [
  { label: 'Internal Ledger vs Bank Statement', count: 72 },
  { label: 'AP Ledger vs Supplier Statement', count: 28 },
  { label: 'GL Ledger vs Bank Statement', count: 12 },
  { label: 'Payroll vs Bank Statement', count: 8 },
  { label: 'Other File Pairs', count: 8 },
]

export default function HistorySidebar() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/80 p-5">
        <h3 className="text-base font-semibold text-white">Quick Filters</h3>

        <div className="mt-4 space-y-1.5">
          {quickFilters.map(({ key, label, count, Icon, iconClassName }) => {
            const isActive = activeFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                    : 'border-transparent text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} />
                  {label}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    isActive ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/5 text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <h3 className="text-base font-semibold text-white">Match Rate Distribution</h3>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative w-34 shrink-0 mt-5">
            <Chart options={matchRateOptions} series={matchRateSegments.map((s) => s.value)} type="donut" height={140} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-xl font-bold text-white">{matchRateTotal}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {matchRateSegments.map((seg) => (
              <li key={seg.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="truncate text-slate-300">{seg.label}</span>
                </span>
                <span className="shrink-0 text-slate-400">
                  {seg.value} ({seg.percent})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/60 p-5">
        <h3 className="text-base font-semibold text-white">Top File Pairs</h3>

        <ul className="mt-4 space-y-3.5">
          {topFilePairs.map((pair) => (
            <li key={pair.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-slate-300">{pair.label}</span>
              <span className="shrink-0 font-medium text-white">{pair.count}</span>
            </li>
          ))}
        </ul>

        <a href="#" className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1CEAEA] hover:underline">
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
