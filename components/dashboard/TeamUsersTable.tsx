'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, MoreVertical } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Role = 'Administrator' | 'Manager' | 'Analyst' | 'Viewer'
type Status = 'Active' | 'Inactive'

type UserRow = {
  name: string
  isYou?: boolean
  avatarBg: string
  initials: string
  src?: string
  email: string
  role: Role
  department: string
  status: Status
  lastActive: string | null
}

const rows: UserRow[] = [
  { name: 'Ousainou J.', isYou: true, avatarBg: 'bg-slate-500', initials: 'OJ', src: '/ousainou.jpg', email: 'ousainou.j@reconcilepro.com', role: 'Administrator', department: 'IT', status: 'Active', lastActive: 'Just now' },
  { name: 'Amie J.', avatarBg: 'bg-teal-500', initials: 'AJ', email: 'amie.j@reconcilepro.com', role: 'Manager', department: 'Finance', status: 'Active', lastActive: '2 hours ago' },
  { name: 'Fatou S.', avatarBg: 'bg-amber-500', initials: 'FS', email: 'fatou.s@reconcilepro.com', role: 'Analyst', department: 'Finance', status: 'Active', lastActive: '1 hour ago' },
  { name: 'Baboucarr M.', avatarBg: 'bg-sky-500', initials: 'BM', email: 'baboucarr.m@reconcilepro.com', role: 'Analyst', department: 'Finance', status: 'Active', lastActive: '3 hours ago' },
  { name: 'Lamin C.', avatarBg: 'bg-violet-500', initials: 'LC', email: 'lamin.c@reconcilepro.com', role: 'Viewer', department: 'Operations', status: 'Active', lastActive: '1 day ago' },
  { name: 'Mariama K.', avatarBg: 'bg-rose-500', initials: 'MK', email: 'mariama.k@reconcilepro.com', role: 'Viewer', department: 'Operations', status: 'Inactive', lastActive: '7 days ago' },
  { name: 'Yusuf B.', avatarBg: 'bg-emerald-500', initials: 'YB', email: 'yusuf.b@reconcilepro.com', role: 'Analyst', department: 'Finance', status: 'Inactive', lastActive: '15 days ago' },
  { name: 'Awa S.', avatarBg: 'bg-indigo-500', initials: 'AS', email: 'awa.s@reconcilepro.com', role: 'Analyst', department: 'Finance', status: 'Active', lastActive: '4 hours ago' }
]

const roleStyles: Record<Role, string> = {
  Administrator: 'bg-indigo-500/15 text-indigo-300',
  Manager: 'bg-sky-500/15 text-sky-300',
  Analyst: 'bg-emerald-500/15 text-emerald-300',
  Viewer: 'bg-slate-500/15 text-slate-300',
}

const statusStyles: Record<Status, string> = {
  Active: 'text-emerald-400',
  Inactive: 'text-amber-400',
}

const statusDotStyles: Record<Status, string> = {
  Active: 'bg-emerald-400',
  Inactive: 'bg-amber-400',
}

const pageItems = [1, 2, 3, 4, 5]

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#232D47] bg-[#0D152A] checked:border-[#1CEAEA] checked:bg-[#1CEAEA]"
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-[#050F20] opacity-0 peer-checked:opacity-100" />
    </span>
  )
}

export default function TeamUsersTable() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  const allSelected = selected.size === rows.length

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.name)))
  }

  const toggleRow = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/10 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="w-8 pb-3 pr-3">
                <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel="Select all" />
              </th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">User</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Email</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Role</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Department</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Last Active</th>
              <th className="pb-3 text-nowrap font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-[#1B2540]">
                <td className="py-3 pr-3 align-top">
                  <Checkbox checked={selected.has(row.name)} onChange={() => toggleRow(row.name)} ariaLabel={`Select ${row.name}`} />
                </td>
                <td className="max-w-44 py-2 pr-4 align-top">
                  <div className="flex items-center gap-2.5">
                    {row.src ? (
                      <Image src={row.src} alt={row.name} width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${row.avatarBg}`}>
                        {row.initials}
                      </span>
                    )}
                    <div className="flex min-w-0 items-center gap-2">
                      <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={row.name}>
                        {row.name}
                      </TruncateTooltip>
                      {row.isYou && (
                        <span className="shrink-0 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="max-w-48 py-3 pr-4 align-top">
                  <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={row.email}>
                    {row.email}
                  </TruncateTooltip>
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${roleStyles[row.role]}`}>
                    {row.role}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.department}</td>
                <td className="py-3 pr-4 align-top">
                  <span className={`flex items-center gap-1.5 text-nowrap font-medium ${statusStyles[row.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[row.status]}`} />
                    {row.status}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.lastActive ?? '—'}</td>
                <td className="py-3 align-top">
                  <button type="button" aria-label="More actions" className="cursor-pointer text-slate-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
        <p className="text-sm text-slate-400">Showing 1 to {rows.length} of 42 users</p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageItems.map((page) => (
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
          ))}
          <button type="button" aria-label="More pages" className="h-8 w-8 cursor-pointer rounded-md text-slate-400 hover:bg-white/5 hover:text-white">
            <MoreHorizontal className="mx-auto h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setCurrentPage((page) => Math.min(pageItems.length, page + 1))}
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
  )
}
