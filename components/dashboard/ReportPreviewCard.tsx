'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CircleSlash, FileText } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const matchSegments = [
  { value: 98243, color: '#34D399' },
  { value: 1412, color: '#FB923C' },
  { value: 312, color: '#FB7185' },
  { value: 17, color: '#A78BFA' },
]

const donutOptions: ApexOptions = {
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: matchSegments.map((s) => s.color),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { show: false },
  plotOptions: { pie: { donut: { size: '68%' } } },
  tooltip: { enabled: false },
}

const trendSeries = [{ name: 'Volume', data: [40, 62, 78, 55, 70, 48, 30] }]

const barOptions: ApexOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#6366F1'],
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 2, columnWidth: '55%' } },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.9, opacityTo: 0.4, gradientToColors: ['#38BDF8'] },
  },
  grid: { show: false },
  legend: { show: false },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { show: false } },
  tooltip: { enabled: false },
}

export default function ReportPreviewCard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
      <h3 className="text-base font-semibold text-white">Report Preview</h3>
      <div className='rounded-2xl border border-[#232D47] bg-[#0E182D]/60 px-2.5'>
      <div className="mt-4 flex items-center gap-3 ">
        <div className="relative flex h-14 w-14 shrink-0 flex-col overflow-hidden rounded-sm bg-slate-300">
          <span className="flex flex-1 items-center justify-center">
            <FileText className="h-5 w-5 text-slate-500" />
          </span>
          <span className="h-1 w-full bg-linear-to-r from-indigo-500 to-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-white">Reconciliation Summary Report</p>
          <p className="mt-0.5 truncate text-sm text-slate-400">June Bank Reconciliation</p>
          <p className="text-xs text-slate-500">Jun 30, 2026</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 border-t border-[#232D47]">
        <div className="border-r border-b border-[#232D47] py-4 pr-4">
          <p className="text-2xl font-bold text-white">98,243</p>
          <p className="text-sm text-slate-400">Matched</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            98.64%
          </p>
        </div>
        <div className="border-b border-[#232D47] py-4 pl-4">
          <p className="text-2xl font-bold text-white">1,412</p>
          <p className="text-sm text-slate-400">Unmatched</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-medium text-rose-400">
            <CircleSlash className="h-3.5 w-3.5" />
            1.42%
          </p>
        </div>

        <div className="border-r border-[#232D47] py-2 pr-4">
          <Chart options={barOptions} series={trendSeries} type="bar" height={90} />
        </div>
        <div className="flex items-center gap-2 py-2 pl-4">
          <div className="min-w-0 flex-1">
            <Chart options={donutOptions} series={matchSegments.map((s) => s.value)} type="donut" height={90} />
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            {matchSegments.map((seg) => (
              <span key={seg.color} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
            ))}
          </div>
        </div>
      </div>
      </div>

      <Link href="#" className="mt-2 flex items-center gap-1 text-sm font-medium text-indigo-400 hover:underline">
        Preview Full Report
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
