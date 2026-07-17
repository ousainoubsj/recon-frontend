'use client'

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Mail } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Role = 'Administrator' | 'Manager' | 'Analyst' | 'Viewer'
type InviteStatus = 'Pending' | 'Expired'

type InviteRow = {
  email: string
  role: Role
  invitedBy: string
  invitedOn: string
  status: InviteStatus
}

const rows: InviteRow[] = [
  { email: 'isatou.j@reconcilepro.com', role: 'Viewer', invitedBy: 'Ousainou J.', invitedOn: 'Jun 28, 2026', status: 'Pending' },
  { email: 'alieu.s@reconcilepro.com', role: 'Viewer', invitedBy: 'Amie J.', invitedOn: 'Jun 27, 2026', status: 'Pending' },
  { email: 'karim.t@reconcilepro.com', role: 'Analyst', invitedBy: 'Ousainou J.', invitedOn: 'Jun 10, 2026', status: 'Expired' },
  { email: 'awa.s@reconcilepro.com', role: 'Analyst', invitedBy: 'Ousainou J.', invitedOn: 'Jun 15, 2026', status: 'Pending' },
  { email: 'mamadou.d@reconcilepro.com', role: 'Manager', invitedBy: 'Ousainou J.', invitedOn: 'Jun 20, 2026', status: 'Expired' },
  { email: 'fatou.k@reconcilepro.com', role: 'Administrator', invitedBy: 'Ousainou J.', invitedOn: 'Jun 25, 2026', status: 'Pending' },
  { email: 'mariama.b@reconcilepro.com', role: 'Viewer', invitedBy: 'Ousainou J.', invitedOn: 'Jun 30, 2026', status: 'Expired' },
  { email: 'binta.d@reconcilepro.com', role: 'Manager', invitedBy: 'Ousainou J.', invitedOn: 'Jun 20, 2026', status: 'Pending' },
  { email: 'mustik.d@reconcilepro.com', role: 'Manager', invitedBy: 'Ousainou J.', invitedOn: 'Jun 20, 2026', status: 'Pending' }
]

const roleStyles: Record<Role, string> = {
  Administrator: 'bg-indigo-500/15 text-indigo-300',
  Manager: 'bg-sky-500/15 text-sky-300',
  Analyst: 'bg-emerald-500/15 text-emerald-300',
  Viewer: 'bg-slate-500/15 text-slate-300',
}

const statusStyles: Record<InviteStatus, string> = {
  Pending: 'text-violet-400',
  Expired: 'text-slate-400',
}

const statusDotStyles: Record<InviteStatus, string> = {
  Pending: 'bg-violet-400',
  Expired: 'bg-slate-500',
}

const pageItems = [1, 2, 3]

export default function TeamInvitationsTable() {
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
      <ScrollArea className="min-w-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-3 pr-4 text-nowrap font-semibold">Email</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Role</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Invited By</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Invited On</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
              <th className="pb-3 text-nowrap font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.email} className="border-t border-[#1B2540]">
                <td className="max-w-52 py-3 pr-4 align-top">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <TruncateTooltip as="p" className="truncate text-white" tooltip={row.email}>
                      {row.email}
                    </TruncateTooltip>
                  </div>
                </td>
                <td className="py-3 pr-4 align-top">
                  <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${roleStyles[row.role]}`}>
                    {row.role}
                  </span>
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.invitedBy}</td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.invitedOn}</td>
                <td className="py-3 pr-4 align-top">
                  <span className={`flex items-center gap-1.5 text-nowrap font-medium ${statusStyles[row.status]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[row.status]}`} />
                    {row.status}
                  </span>
                </td>
                <td className="py-3 align-top">
                  <div className="flex items-center gap-4">
                    <button type="button" className="cursor-pointer text-sm font-medium text-indigo-400 hover:underline">
                      Resend
                    </button>
                    <button type="button" className="cursor-pointer text-sm font-medium text-rose-400 hover:underline">
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
        <p className="text-sm text-slate-400">Showing 1 to {rows.length} of {rows.length} invitations</p>

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
