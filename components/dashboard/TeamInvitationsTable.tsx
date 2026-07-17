import { Mail } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type InviteStatus = 'Pending' | 'Expired'

type InviteRow = {
  email: string
  role: string
  invitedBy: string
  invitedOn: string
  status: InviteStatus
}

const rows: InviteRow[] = [
  { email: 'isatou.j@reconcilepro.com', role: 'Viewer', invitedBy: 'Ousainou J.', invitedOn: 'Jun 28, 2026', status: 'Pending' },
  { email: 'alieu.s@reconcilepro.com', role: 'Viewer', invitedBy: 'Amie J.', invitedOn: 'Jun 27, 2026', status: 'Pending' },
  { email: 'karim.t@reconcilepro.com', role: 'Analyst', invitedBy: 'Ousainou J.', invitedOn: 'Jun 10, 2026', status: 'Expired' },
]

const statusStyles: Record<InviteStatus, string> = {
  Pending: 'text-violet-400',
  Expired: 'text-slate-400',
}

const statusDotStyles: Record<InviteStatus, string> = {
  Pending: 'bg-violet-400',
  Expired: 'bg-slate-500',
}

export default function TeamInvitationsTable() {
  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
      <div className="overflow-x-auto">
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
                  <span className="inline-block text-nowrap rounded-md bg-slate-500/15 px-2.5 py-1 text-xs font-medium text-slate-300">
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
      </div>

      <div className="mt-1 border-t border-[#232D47] pt-3">
        <p className="text-sm text-slate-400">Showing 1 to {rows.length} of {rows.length} invitations</p>
      </div>
    </div>
  )
}
