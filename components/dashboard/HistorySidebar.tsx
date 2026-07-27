'use client'

import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowRight, CheckCircle2, Files, Star, XCircle } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { Skeleton } from '@/components/ui/skeleton'
import { useMatchRateDistribution, useReports, useTopFilePairs } from '@/lib/hooks/useReports'
import { matchesHistoryFilter, type HistoryFilterKey } from '@/lib/historyFilters'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// No count-with-filters endpoint exists server-side — fetch a generous
// capped set once (independent of whatever the table's own search/date
// filters happen to be) purely to derive these 5 quick-filter counts.
const COUNTS_FETCH_CAP = 200

const quickFilterDefs: {
  key: HistoryFilterKey
  label: string
  Icon: typeof Files
  iconClassName: string
}[] = [
  { key: 'all', label: 'All Reconciliations', Icon: Files, iconClassName: 'text-indigo-300' },
  { key: 'completed', label: 'Completed', Icon: CheckCircle2, iconClassName: 'text-emerald-400' },
  { key: 'issues', label: 'Completed with Issues', Icon: AlertTriangle, iconClassName: 'text-amber-400' },
  { key: 'failed', label: 'Failed', Icon: XCircle, iconClassName: 'text-rose-400' },
  { key: 'favorite', label: 'Favorites', Icon: Star, iconClassName: 'text-blue-400' },
]

const BUCKET_COLOR: Record<string, string> = {
  '≥ 99%': '#34D399',
  '95% - 98.99%': '#2DD4BF',
  '90% - 94.99%': '#818CF8',
  '< 90%': '#FB923C',
  Failed: '#FB7185',
}

function EmptyTopFilePairs() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyFilePairsGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="8" y="14" width="30" height="38" rx="4" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <rect x="14" y="22" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        <rect x="14" y="28" width="14" height="2.5" rx="1.25" fill="#2C3654" />
        <rect x="14" y="34" width="16" height="2.5" rx="1.25" fill="#2C3654" />
        <rect x="30" y="8" width="30" height="38" rx="4" fill="#0F1830" stroke="url(#emptyFilePairsGlow)" strokeOpacity="0.5" strokeWidth="1.5" />
        <rect x="36" y="16" width="18" height="2.5" rx="1.25" fill="#1CEAEA" fillOpacity="0.35" />
        <rect x="36" y="22" width="14" height="2.5" rx="1.25" fill="#2C3654" />
        <rect x="36" y="28" width="16" height="2.5" rx="1.25" fill="#2C3654" />
      </svg>
      <p className="text-sm text-slate-400">No file pairs yet</p>
    </div>
  )
}

function DonutChartSkeleton() {
  return (
    <div className="mt-5 flex items-center gap-4">
      <div className="relative w-34 shrink-0">
        <svg viewBox="0 0 140 140" className="h-35 w-35 animate-pulse" style={{ animationDuration: '1.8s' }}>
          <circle cx="70" cy="70" r="50" fill="none" stroke="#1B2540" strokeWidth="20" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-2.5 w-10" />
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

type HistorySidebarProps = {
  activeFilter: HistoryFilterKey
  onFilterChange: (filter: HistoryFilterKey) => void
  // "View All" under Top File Pairs — there's no separate "all file pairs"
  // page, so it scrolls to and briefly highlights the table below instead,
  // same concept as Audit Log's "View All Actions".
  onViewAllFilePairs?: () => void
}

export default function HistorySidebar({ activeFilter, onFilterChange, onViewAllFilePairs }: HistorySidebarProps) {
  const { data: allReports } = useReports({ limit: COUNTS_FETCH_CAP })
  const { data: distribution, isLoading: isDistributionLoading } = useMatchRateDistribution()
  const { data: topFilePairs, isLoading: isTopFilePairsLoading } = useTopFilePairs()

  const counts: Record<HistoryFilterKey, number> = {
    all: 0,
    completed: 0,
    issues: 0,
    failed: 0,
    favorite: 0,
  }
  for (const report of allReports ?? []) {
    for (const key of Object.keys(counts) as HistoryFilterKey[]) {
      if (matchesHistoryFilter(report, key)) counts[key] += 1
    }
  }

  const matchRateTotal = (distribution ?? []).reduce((sum, seg) => sum + seg.value, 0)

  const matchRateOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: (distribution ?? []).map((s) => s.label),
    colors: (distribution ?? []).map((s) => BUCKET_COLOR[s.label] ?? '#64748B'),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '72%' } } },
    tooltip: { theme: 'dark' },
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/80 p-5">
        <h3 className="text-base font-semibold text-white">Quick Filters</h3>

        <div className="mt-4 space-y-1.5">
          {quickFilterDefs.map(({ key, label, Icon, iconClassName }) => {
            const isActive = activeFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onFilterChange(key)}
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
                  {counts[key]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <h3 className="text-base font-semibold text-white">Match Rate Distribution</h3>

        {isDistributionLoading || !distribution ? (
          <DonutChartSkeleton />
        ) : (
          <div className="mt-5 flex items-center gap-4">
            <div className="relative w-34 shrink-0 mt-5">
              <Chart options={matchRateOptions} series={distribution.map((s) => s.value)} type="donut" height={140} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xl font-bold text-white">{matchRateTotal}</p>
                <p className="text-xs text-slate-400">Total</p>
              </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-2.5">
              {distribution.map((seg) => (
                <li key={seg.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: BUCKET_COLOR[seg.label] ?? '#64748B' }} />
                    <span className="truncate text-slate-300">{seg.label}</span>
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {seg.value} ({seg.percent})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/60 p-5">
        <h3 className="text-base font-semibold text-white">Top File Pairs</h3>

        {isTopFilePairsLoading || !topFilePairs ? (
          <ul className="mt-4 space-y-3.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-8" />
              </li>
            ))}
          </ul>
        ) : topFilePairs.length === 0 ? (
          <EmptyTopFilePairs />
        ) : (
          <ul className="mt-4 space-y-3.5">
            {topFilePairs.map((pair) => (
              <li key={pair.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-slate-300">{pair.label}</span>
                <span className="shrink-0 font-medium text-white">{pair.count}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onViewAllFilePairs}
          className="mt-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#1CEAEA] hover:underline"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
