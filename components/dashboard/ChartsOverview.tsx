'use client'

import dynamic from 'next/dynamic'
import { ChevronDown } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const matchRateSeries = [{ name: 'Match Rate', data: [90.5, 94.2, 94.6, 97.8, 96.9, 98.64] }]

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
    categories: months,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94A3B8' } },
  },
  yaxis: {
    min: 85,
    max: 100,
    tickAmount: 3,
    labels: { formatter: (value) => `${value}%`, style: { colors: '#94A3B8' } },
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (value) => `${value}%` },
    x: { formatter: (_value, opts) => `${months[opts?.dataPointIndex ?? 0]} 2026` },
  },
}

const volumeSeries = [{ name: 'Volume', data: [52, 120, 88, 102, 132, 150] }]

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
    categories: months,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#94A3B8' } },
  },
  yaxis: {
    min: 0,
    max: 160,
    tickAmount: 4,
    labels: { style: { colors: '#94A3B8' } },
  },
  tooltip: { theme: 'dark' },
}

const categoryBreakdown = [
  { label: 'Matched', value: 63231, percent: '98.64%', color: '#34D399' },
  { label: 'Mismatched', value: 841, percent: '1.31%', color: '#6366F1' },
  { label: 'Internal Only', value: 712, percent: '1.11%', color: '#F59E0B' },
  { label: 'Counterparty Only', value: 513, percent: '0.80%', color: '#3B82F6' },
  { label: 'Duplicates', value: 154, percent: '0.24%', color: '#F43F5E' },
]

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


function CardHeader({ title, control }: { title: string; control: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-slate-300"
      >
        {control}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export default function ChartsOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Match Rate Trend" control="Last 6 Months" />
        <Chart options={matchRateOptions} series={matchRateSeries} type="area" height={220} />
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Reconciliation Volume" control="Last 6 Months" />
        <Chart options={volumeOptions} series={volumeSeries} type="bar" height={220} />
      </div>

      <div className="flex flex-col rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-3">
        <CardHeader title="Breakdown by Category" control="This Month" />
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-44 -mb-4.5 shrink-0">
            <Chart options={donutOptions} series={categoryBreakdown.map((c) => c.value)} type="donut" height={200} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-white">64,451</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>

          <ul className="flex-1 space-y-2.5 text-xs">
            {categoryBreakdown.map(({ label, value, percent, color }) => (
              <li key={label} className="flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
                <span className="text-slate-400">
                  {value.toLocaleString()} ({percent})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
