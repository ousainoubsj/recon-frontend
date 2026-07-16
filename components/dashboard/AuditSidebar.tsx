'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Cog, FileSymlink, FileText, PlayCircle, UserPlus } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const activitySegments = [
  { label: 'Successful', value: 11256, percent: '87.6%', color: '#34D399' },
  { label: 'Failed', value: 286, percent: '2.2%', color: '#FB7185' },
  { label: 'Warning', value: 642, percent: '5.0%', color: '#FBBF24' },
  { label: 'Info', value: 658, percent: '5.1%', color: '#60A5FA' },
]

const activityOptions: ApexOptions = {
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: activitySegments.map((s) => s.label),
  colors: activitySegments.map((s) => s.color),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { show: false },
  plotOptions: { pie: { donut: { size: '72%' } } },
  tooltip: { theme: 'dark' },
}

const topActions = [
  { label: 'Reconciliation Created', count: '1,248', Icon: PlayCircle },
  { label: 'Files Uploaded', count: '1,183', Icon: FileText },
  { label: 'Column Mapping Updated', count: '1,102', Icon: FileSymlink },
  { label: 'Matching Rules Modified', count: '982', Icon: Cog },
  { label: 'Reconciliation Processing Started', count: '876', Icon: PlayCircle },
]

const topUsers: { name: string; count: string; src?: string; initials?: string; bg?: string; Icon?: typeof Cog }[] = [
  { name: 'Ousainou J.', count: '4,562', src: '/ousainou.jpg' },
  { name: 'Amie J.', count: '3,245', initials: 'AJ', bg: 'bg-teal-500' },
  { name: 'Fatou S.', count: '2,110', initials: 'FS', bg: 'bg-amber-500' },
  { name: 'System', count: '1,923', Icon: Cog, bg: 'bg-slate-600' },
  { name: 'Other Users', count: '1,002', Icon: UserPlus, bg: 'bg-slate-600' },
]

function UserAvatar({ user }: { user: (typeof topUsers)[number] }) {
  if (user.src) {
    return <Image src={user.src} alt={user.name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  }

  if (user.Icon) {
    const { Icon } = user
    return (
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-200 ${user.bg ?? 'bg-slate-600'}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
    )
  }

  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${user.bg ?? 'bg-slate-500'}`}>
      {user.initials}
    </span>
  )
}

const logDetails = [
  { label: 'User', value: 'Ousainou J.' },
  { label: 'Module', value: 'Reconciliation' },
  { label: 'Time', value: 'Jun 30, 2026 10:28:45 AM' },
  { label: 'IP Address', value: '192.168.1.10' },
]

export default function AuditSidebar() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Activity Summary</h3>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"
          >
            Last 30 Days
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="w-32 mt-5 shrink-0">
            <Chart options={activityOptions} series={activitySegments.map((s) => s.value)} type="donut" height={150} />
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {activitySegments.map((seg) => (
              <li key={seg.label} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="truncate text-slate-300">{seg.label}</span>
                </span>
                <span className="shrink-0 text-slate-400">
                  {seg.value.toLocaleString()} ({seg.percent})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Top Actions</h3>

        <ul className="mt-4 space-y-3.5">
          {topActions.map(({ label, count, Icon }) => (
            <li key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{label}</span>
              </span>
              <span className="shrink-0 font-medium text-white">{count}</span>
            </li>
          ))}
        </ul>

        <a href="#" className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400 hover:underline">
          View All Actions
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Top Users</h3>

        <ul className="mt-4 space-y-3.5">
          {topUsers.map((user) => (
            <li key={user.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-300">
                <UserAvatar user={user} />
                <span className="truncate">{user.name}</span>
              </span>
              <span className="shrink-0 font-medium text-white">{user.count}</span>
            </li>
          ))}
        </ul>

        <a href="#" className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400 hover:underline">
          View All Users
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Log Details</h3>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
            <FileText className="h-4 w-4" />
          </span>
          <p className="font-semibold text-white">Reconciliation Created</p>
        </div>

        <div className="mt-4 space-y-2.5 text-sm">
          {logDetails.map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="w-24 shrink-0 text-slate-400">{label}</span>
              <span className="text-slate-200">{value}</span>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <span className="w-24 shrink-0 text-slate-400">Status</span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">Success</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-24 shrink-0 text-slate-400">Details</span>
            <span className="text-slate-300">
              Reconciliation &ldquo;June Bank Reconciliation&rdquo; was created with ID REC-2026-000128.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
