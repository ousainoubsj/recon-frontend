'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Menu } from '@base-ui/react/menu'
import { ChevronDown } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format'
import { useReportsTrend } from '@/lib/hooks/useReports'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const PERIOD_OPTIONS = [
  { months: 3, label: 'Last 3 Months' },
  { months: 6, label: 'Last 6 Months' },
  { months: 12, label: 'Last 12 Months' },
]

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', { month: 'short' })
}

// Real backend split is 4-way (Matched/Mismatched/Unmatched/Duplicates) —
// unmatched_a/unmatched_b are merged server-side at save time, so there's no
// separate "Internal Only"/"Counterparty Only" the mock's 5-way split had.
const CATEGORY_DEFS = [
  { key: 'matched' as const, label: 'Matched', color: '#34D399' },
  { key: 'mismatched' as const, label: 'Mismatched', color: '#6366F1' },
  { key: 'unmatched' as const, label: 'Unmatched', color: '#3B82F6' },
  { key: 'duplicates' as const, label: 'Duplicates', color: '#F43F5E' },
]

function CardHeader({ title, control }: { title: string; control: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {typeof control === 'string' ? (
        <span className="rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-slate-400">
          {control}
        </span>
      ) : (
        control
      )}
    </div>
  )
}

function PeriodSelector({ months, onChange }: { months: number; onChange: (months: number) => void }) {
  const label = PERIOD_OPTIONS.find((o) => o.months === months)?.label ?? 'Last 6 Months'

  return (
    <Menu.Root>
      <Menu.Trigger className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-slate-300 outline-none transition-colors duration-300 hover:text-white">
        {label}
        <ChevronDown className="h-3.5 w-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="min-w-40 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
            {PERIOD_OPTIONS.map((option) => (
              <Menu.Item
                key={option.months}
                onClick={() => onChange(option.months)}
                className="flex cursor-pointer items-center rounded-md px-3 py-2 text-xs text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
              >
                {option.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

export default function ChartsOverview() {
  const [months, setMonths] = useState(6)
  const { data: trend, isLoading } = useReportsTrend(months)

  if (isLoading || !trend) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
            <Skeleton className="mb-4 h-5 w-40" />
            <Skeleton className="h-55 w-full" />
          </div>
        ))}
      </div>
    )
  }

  const monthLabels = trend.matchRateSeries.map((p) => monthLabel(p.month))
  const matchRateSeries = [{ name: 'Match Rate', data: trend.matchRateSeries.map((p) => Number(p.value.toFixed(2))) }]
  const volumeSeries = [{ name: 'Volume', data: trend.volumeSeries.map((p) => p.value) }]

  const matchRateOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#34D399'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 4, colors: ['#34D399'], strokeColors: '#0A1128', strokeWidth: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 90, 100] },
    },
    grid: { borderColor: '#232D47', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    xaxis: {
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94A3B8' } },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 3,
      labels: { formatter: (value) => `${value}%`, style: { colors: '#94A3B8' } },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (value) => `${value}%` },
    },
  }

  const volumeOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6, borderRadiusApplication: 'end' } },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.5, gradientToColors: ['#60A5FA'], opacityFrom: 1, opacityTo: 1, stops: [0, 100] },
    },
    colors: ['#2563EB'],
    grid: { borderColor: '#232D47', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    xaxis: {
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94A3B8' } },
    },
    yaxis: {
      min: 0,
      labels: { style: { colors: '#94A3B8' } },
    },
    tooltip: { theme: 'dark' },
  }

  const categoryBreakdown = CATEGORY_DEFS.map((def) => ({ ...def, value: trend.categoryBreakdown[def.key] }))
  const categoryTotal = categoryBreakdown.reduce((sum, c) => sum + c.value, 0)

  const donutOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: categoryBreakdown.map((c) => c.label),
    colors: categoryBreakdown.map((c) => c.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '78%' } } },
    tooltip: { theme: 'dark' },
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Match Rate Trend" control={<PeriodSelector months={months} onChange={setMonths} />} />
        <Chart options={matchRateOptions} series={matchRateSeries} type="area" height={220} />
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Reconciliation Volume" control={<PeriodSelector months={months} onChange={setMonths} />} />
        <Chart options={volumeOptions} series={volumeSeries} type="bar" height={220} />
      </div>

      <div className="flex flex-col rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Breakdown by Category" control="This Month" />
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-44 -mb-4.5 shrink-0">
            <Chart options={donutOptions} series={categoryBreakdown.map((c) => c.value)} type="donut" height={200} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-white">{formatNumber(categoryTotal)}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>

          <ul className="flex-1 space-y-2.5 text-xs">
            {categoryBreakdown.map(({ label, value, color }) => (
              <li key={label} className="flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
                <span className="text-slate-400">
                  {formatNumber(value)} ({categoryTotal > 0 ? ((value / categoryTotal) * 100).toFixed(2) : '0.00'}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
