'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Mail } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import { formatDate } from '@/lib/format'
import { ROLE_LABELS, type Invitation, type MemberRole, type TeamMember } from '@/types/team'

type TeamInvitationsTableProps = {
  invitations?: Invitation[]
  isLoading?: boolean
  members?: TeamMember[]
  q: string
  role: MemberRole | 'all'
}

const roleStyles: Record<string, string> = {
  admin: 'bg-indigo-500/15 text-indigo-300',
  analyst: 'bg-emerald-500/15 text-emerald-300',
  viewer: 'bg-slate-500/15 text-slate-300',
}

function isExpired(invitation: Invitation) {
  return new Date(invitation.expiresAt).getTime() < Date.now()
}

export default function TeamInvitationsTable({ invitations, isLoading, members, q, role }: TeamInvitationsTableProps) {
  const queryClient = useQueryClient()
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const inviterName = (inviterId: string) => members?.find((m) => m.userId === inviterId)?.user.name ?? 'Team admin'

  const rows = (invitations ?? [])
    .filter((inv) => inv.status === 'pending')
    .filter((inv) => (role === 'all' ? true : inv.role === role))
    .filter((inv) => (q.trim() ? inv.email.toLowerCase().includes(q.trim().toLowerCase()) : true))

  const setPending = (id: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev)
      if (isPending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleResend = async (invitation: Invitation) => {
    setPending(invitation.id, true)
    // Cast: see TeamHeader.tsx's handleInvite for why.
    const { error } = await authClient.organization.inviteMember({
      email: invitation.email,
      role: invitation.role ?? 'viewer',
      resend: true,
    } as Parameters<typeof authClient.organization.inviteMember>[0])
    setPending(invitation.id, false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to resend invitation'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    toast.success('Invitation resent')
  }

  const handleCancel = async (invitation: Invitation) => {
    setPending(invitation.id, true)
    const { error } = await authClient.organization.cancelInvitation({ invitationId: invitation.id })
    setPending(invitation.id, false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to cancel invitation'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    toast.success('Invitation canceled')
  }

  if (isLoading || !invitations) {
    return (
      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
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
            {[0, 1, 2].map((i) => (
              <tr key={i} className="border-t border-[#1B2540]">
                <td className="py-3 pr-4 align-top">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-14" />
                </td>
                <td className="py-3 align-top">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  No pending invitations.
                </td>
              </tr>
            ) : (
              rows.map((invitation) => {
                const expired = isExpired(invitation)
                const isPending = pendingIds.has(invitation.id)
                return (
                  <tr key={invitation.id} className="border-t border-[#1B2540]">
                    <td className="max-w-52 py-3 pr-4 align-top">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <TruncateTooltip as="p" className="truncate text-white" tooltip={invitation.email}>
                          {invitation.email}
                        </TruncateTooltip>
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${roleStyles[invitation.role ?? 'viewer']}`}>
                        {ROLE_LABELS[invitation.role ?? 'viewer']}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{inviterName(invitation.inviterId)}</td>
                    <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{formatDate(invitation.createdAt)}</td>
                    <td className="py-3 pr-4 align-top">
                      <span className={`flex items-center gap-1.5 text-nowrap font-medium ${expired ? 'text-slate-400' : 'text-violet-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${expired ? 'bg-slate-500' : 'bg-violet-400'}`} />
                        {expired ? 'Expired' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 align-top">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleResend(invitation)}
                          disabled={isPending}
                          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(invitation)}
                          disabled={isPending}
                          className="cursor-pointer text-sm font-medium text-rose-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
