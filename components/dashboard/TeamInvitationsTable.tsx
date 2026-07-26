'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2, Mail } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import { formatDate } from '@/lib/format'
import { getPageItems } from '@/lib/pagination'
import { ROLE_LABELS, type Invitation, type MemberRole, type TeamMember } from '@/types/team'

const PAGE_SIZE = 8

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

function EmptyInvitations() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyInvitesGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="18" y="16" width="76" height="48" rx="8" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <path d="M18 22 L56 46 L94 22" stroke="#232D47" strokeWidth="1.5" fill="none" />
        <rect x="28" y="52" width="30" height="3" rx="1.5" fill="#2C3654" />
        <circle cx="34" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <path
          d="M27 66.5 L31.5 71 L41.5 61"
          stroke="url(#emptyInvitesGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">No pending invitations</p>
        <p className="mt-1 text-xs text-slate-400">Everyone you&apos;ve invited has already joined, or there&apos;s nothing to show yet.</p>
      </div>
    </div>
  )
}

export default function TeamInvitationsTable({ invitations, isLoading, members, q, role }: TeamInvitationsTableProps) {
  const queryClient = useQueryClient()
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())
  const [cancelingIds, setCancelingIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const inviterName = (inviterId: string) => members?.find((m) => m.userId === inviterId)?.user.name ?? 'Team admin'

  const rows = (invitations ?? [])
    .filter((inv) => inv.status === 'pending')
    .filter((inv) => (role === 'all' ? true : inv.role === role))
    .filter((inv) => (q.trim() ? inv.email.toLowerCase().includes(q.trim().toLowerCase()) : true))

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  // Clamp instead of resetting via an effect — safe even if filters shrink
  // the result set out from under the current page.
  const safePage = Math.min(page, totalPages)
  const pagedRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const setInSet = (setter: typeof setResendingIds, id: string, isPending: boolean) => {
    setter((prev) => {
      const next = new Set(prev)
      if (isPending) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleResend = async (invitation: Invitation) => {
    setInSet(setResendingIds, invitation.id, true)
    // Cast: see TeamHeader.tsx's handleInvite for why.
    const { error } = await authClient.organization.inviteMember({
      email: invitation.email,
      role: invitation.role ?? 'viewer',
      resend: true,
    } as Parameters<typeof authClient.organization.inviteMember>[0])
    setInSet(setResendingIds, invitation.id, false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to resend invitation'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    toast.success('Invitation resent')
  }

  const handleCancel = async (invitation: Invitation) => {
    setInSet(setCancelingIds, invitation.id, true)
    const { error } = await authClient.organization.cancelInvitation({ invitationId: invitation.id })
    setInSet(setCancelingIds, invitation.id, false)
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
                <td colSpan={6}>
                  <EmptyInvitations />
                </td>
              </tr>
            ) : (
              pagedRows.map((invitation) => {
                const expired = isExpired(invitation)
                const isResending = resendingIds.has(invitation.id)
                const isCanceling = cancelingIds.has(invitation.id)
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
                          disabled={isResending || isCanceling}
                          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isResending && <Loader2 className="h-3 w-3 animate-spin" />}
                          {isResending ? 'Resending...' : 'Resend'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancel(invitation)}
                          disabled={isResending || isCanceling}
                          className="flex cursor-pointer items-center gap-1 text-sm font-medium text-rose-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCanceling && <Loader2 className="h-3 w-3 animate-spin" />}
                          {isCanceling ? 'Canceling...' : 'Cancel'}
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

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
        <p className="text-sm text-slate-400">
          Showing {pagedRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {(safePage - 1) * PAGE_SIZE + pagedRows.length} of{' '}
          {rows.length} invitations
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => setPage(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {getPageItems(safePage, totalPages).map((item, i) =>
            item === '...' ? (
              <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-slate-500">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                  safePage === item ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            onClick={() => setPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <span className="rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300">{PAGE_SIZE} / page</span>
      </div>
    </div>
  )
}
