'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Cog,
  Columns3,
  Download,
  Eye,
  LogIn,
  MoreVertical,
  PlayCircle,
  CheckCircle2,
  CirclePlus,
  Search,
  SlidersHorizontal,
  Tag,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type UserInfo = {
  name: string
  role: string
  src?: string
  initials?: string
  avatarBg?: string
  Icon?: LucideIcon
}

type LogRow = {
  date: string
  time: string
  Icon: LucideIcon
  iconBg: string
  iconColor: string
  user: UserInfo
  action: string
  module: string
  moduleClassName: string
  details: string[]
  ip: string
}

const rows: LogRow[] = [
  {
    date: 'Jun 30, 2026',
    time: '10:28:45 AM',
    Icon: CirclePlus,
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    user: { name: 'Ousainou J.', role: 'Administrator', src: '/ousainou.jpg' },
    action: 'Reconciliation Created',
    module: 'Reconciliation',
    moduleClassName: 'bg-indigo-500/15 text-indigo-300',
    details: ['June Bank Reconciliation', '(ID: REC-2026-000128)'],
    ip: '192.168.1.10',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:27:12 AM',
    Icon: Upload,
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    user: { name: 'Amie J.', role: 'Manager', initials: 'AJ', avatarBg: 'bg-teal-500' },
    action: 'Files Uploaded',
    module: 'Reconciliation',
    moduleClassName: 'bg-indigo-500/15 text-indigo-300',
    details: ['Internal_Ledger_June.csv,', 'Bank_Statement_June.csv'],
    ip: '192.168.1.22',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:23:31 AM',
    Icon: Columns3,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    user: { name: 'Fatou S.', role: 'Analyst', initials: 'FS', avatarBg: 'bg-amber-500' },
    action: 'Column Mapping Updated',
    module: 'Mapping',
    moduleClassName: 'bg-sky-500/15 text-sky-300',
    details: ['Updated 3 column mappings'],
    ip: '192.168.1.33',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:22:18 AM',
    Icon: SlidersHorizontal,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    user: { name: 'Fatou S.', role: 'Analyst', initials: 'FS', avatarBg: 'bg-amber-500' },
    action: 'Matching Rules Modified',
    module: 'Mapping',
    moduleClassName: 'bg-sky-500/15 text-sky-300',
    details: ['Amount tolerance changed', 'to 0.01'],
    ip: '192.168.1.33',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:20:05 AM',
    Icon: PlayCircle,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    user: { name: 'Amie J.', role: 'Manager', initials: 'AJ', avatarBg: 'bg-teal-500' },
    action: 'Reconciliation Processing Started',
    module: 'Processing',
    moduleClassName: 'bg-amber-500/15 text-amber-300',
    details: ['Engine started for', 'REC-2026-000128'],
    ip: '192.168.1.22',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:21:47 AM',
    Icon: CheckCircle2,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    user: { name: 'System', role: 'System Process', Icon: Cog, avatarBg: 'bg-slate-600' },
    action: 'Reconciliation Processing Completed',
    module: 'Processing',
    moduleClassName: 'bg-amber-500/15 text-amber-300',
    details: ['Match Rate: 98.64%', 'Break Value: $312,450.75'],
    ip: '10.0.0.5',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:25:33 AM',
    Icon: Eye,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    user: { name: 'Ousainou J.', role: 'Administrator', src: '/ousainou.jpg' },
    action: 'Viewed Reconciliation Results',
    module: 'Results',
    moduleClassName: 'bg-emerald-500/15 text-emerald-300',
    details: ['Viewed results for', 'REC-2026-000128'],
    ip: '192.168.1.10',
  },
  {
    date: 'Jun 30, 2026',
    time: '10:26:10 AM',
    Icon: Download,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    user: { name: 'Ousainou J.', role: 'Administrator', src: '/ousainou.jpg' },
    action: 'Exported Report',
    module: 'Reports',
    moduleClassName: 'bg-sky-500/15 text-sky-300',
    details: ['Reconciliation Summary', '(PDF) exported'],
    ip: '192.168.1.10',
  },
  {
    date: 'Jun 30, 2026',
    time: '09:15:44 AM',
    Icon: LogIn,
    iconBg: 'bg-slate-500/15',
    iconColor: 'text-slate-300',
    user: { name: 'Amie J.', role: 'Manager', initials: 'AJ', avatarBg: 'bg-teal-500' },
    action: 'User Login',
    module: 'Authentication',
    moduleClassName: 'bg-slate-500/15 text-slate-300',
    details: ['Successfull login'],
    ip: '192.168.1.22',
  },
]

const pageItems: (number | '...')[] = [1, 2, 3, 4, 5, '...', 1427]

function UserAvatar({ user }: { user: UserInfo }) {
  if (user.src) {
    return <Image src={user.src} alt={user.name} width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
  }

  if (user.Icon) {
    const { Icon } = user
    return (
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-200 ${user.avatarBg ?? 'bg-slate-600'}`}>
        <Icon className="h-4 w-4" />
      </span>
    )
  }

  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${user.avatarBg ?? 'bg-slate-500'}`}>
      {user.initials}
    </span>
  )
}

export default function AuditLogTable() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search by user, action, module..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-6 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          All Modules
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-6 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          All Users
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
          Jun 01, 2026 - Jun 30, 2026
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
      <ScrollArea className="min-w-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-3 pr-4 text-nowrap font-semibold">
                <span className="flex items-center gap-1">
                  Time
                  <ChevronsUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">User</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Action</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Module</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Details</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">IP Address</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
              <th className="pb-3 text-nowrap font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-[#1B2540]">
                <td className="py-3 pr-4 align-top">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${row.iconBg} ${row.iconColor}`}>
                      <row.Icon className="h-4 w-4" />
                    </span>
                    <div className="text-nowrap">
                      <p className="text-slate-200">{row.date}</p>
                      <p className="text-xs text-slate-400">{row.time}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-40 py-3 pr-4 align-top">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar user={row.user} />
                    <div className="min-w-0">
                      <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={row.user.name}>
                        {row.user.name}
                      </TruncateTooltip>
                      <p className="text-xs text-slate-400">{row.user.role}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-48 py-3 pr-4 align-top">
                  <TruncateTooltip as="p" className="truncate text-slate-200" tooltip={row.action}>
                    {row.action}
                  </TruncateTooltip>
                </td>
                <td className="py-3 pr-4 align-center">
                  <span className={`inline-flex items-center gap-1 text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${row.moduleClassName}`}>
                    <Tag className="h-3 w-3" />
                    {row.module}
                  </span>
                </td>
                <td className="max-w-52 py-3 pr-4 align-top">
                  {row.details.map((line) => (
                    <p key={line} className="truncate text-slate-300">
                      {line}
                    </p>
                  ))}
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.ip}</td>
                <td className="py-3 pr-4 align-top">
                  <span className="inline-block text-nowrap rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    Success
                  </span>
                </td>
                <td className="py-3 align-top">
                  <button type="button" aria-label="More actions" className="cursor-pointer text-slate-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
        <p className="text-sm text-slate-400">Showing 1 to {rows.length} of 12,842 activities</p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageItems.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                  currentPage === page ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {page}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setCurrentPage((page) => Math.min(1427, page + 1))}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
        >
          10 / page
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      </div>
    </div>
  )
}
