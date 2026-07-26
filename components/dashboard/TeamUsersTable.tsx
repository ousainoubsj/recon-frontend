'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Menu } from '@base-ui/react/menu'
import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import { useUpdateMember } from '@/lib/hooks/useTeam'
import { formatRelativeTime } from '@/lib/format'
import { ROLE_LABELS, ROLE_OPTIONS, type MemberRole, type TeamMember } from '@/types/team'

type TeamUsersTableProps = {
  members?: TeamMember[]
  isLoading?: boolean
  onSelect?: (id: string) => void
  currentUserId?: string
  page: number
  onPageChange: (page: number) => void
  totalCount: number
  pageSize: number
}

const roleStyles: Record<MemberRole, string> = {
  admin: 'bg-indigo-500/15 text-indigo-300',
  analyst: 'bg-emerald-500/15 text-emerald-300',
  viewer: 'bg-slate-500/15 text-slate-300',
}

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

export default function TeamUsersTable({
  members,
  isLoading,
  onSelect,
  currentUserId,
  page,
  onPageChange,
  totalCount,
  pageSize,
}: TeamUsersTableProps) {
  const queryClient = useQueryClient()
  const updateMember = useUpdateMember()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [pendingRoleChangeId, setPendingRoleChangeId] = useState<string | null>(null)

  const rows = members ?? []
  const allSelected = rows.length > 0 && selected.size === rows.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(rows.map((row) => row.id)))
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRoleChange = async (member: TeamMember, role: MemberRole) => {
    if (role === member.role) return
    setPendingRoleChangeId(member.id)
    const { error } = await authClient.organization.updateMemberRole({ memberId: member.id, role })
    setPendingRoleChangeId(null)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to update role'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    toast.success('Role updated')
  }

  const handleToggleStatus = (member: TeamMember) => {
    updateMember.mutate(
      { id: member.id, data: { status: member.status === 'active' ? 'inactive' : 'active' } },
      { onSuccess: () => toast.success(member.status === 'active' ? 'User deactivated' : 'User activated') },
    )
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setIsRemoving(true)
    const { error } = await authClient.organization.removeMember({ memberIdOrEmail: removeTarget.user.email })
    setIsRemoving(false)
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to remove user'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    toast.success('User removed')
    setRemoveTarget(null)
  }

  if (isLoading || !members) {
    return (
      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/10 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="w-8 pb-3 pr-3" />
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
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-t border-[#1B2540]">
                <td className="py-3 pr-3 align-top">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>
                <td className="py-2 pr-4 align-top">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-36" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-5 w-20 rounded-md" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-16" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-12" />
                </td>
                <td className="py-3 pr-4 align-top">
                  <Skeleton className="h-3 w-16" />
                </td>
                <td className="py-3 align-top">
                  <Skeleton className="h-4 w-4 rounded" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/10 p-4">
      <ScrollArea className="min-w-0">
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-slate-400">
                  No team members match these filters.
                </td>
              </tr>
            ) : (
              rows.map((member) => {
                const isYou = member.userId === currentUserId
                return (
                  <tr
                    key={member.id}
                    onClick={() => onSelect?.(member.id)}
                    className="cursor-pointer border-t border-[#1B2540] hover:bg-white/3"
                  >
                    <td className="py-3 pr-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(member.id)} onChange={() => toggleRow(member.id)} ariaLabel={`Select ${member.user.name}`} />
                    </td>
                    <td className="max-w-44 py-2 pr-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500 text-xs font-semibold text-white">
                          {member.user.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                          <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={member.user.name}>
                            {member.user.name}
                          </TruncateTooltip>
                          {isYou && (
                            <span className="shrink-0 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-48 py-3 pr-4 align-top">
                      <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={member.user.email}>
                        {member.user.email}
                      </TruncateTooltip>
                    </td>
                    <td className="py-3 pr-4 align-top" onClick={(e) => e.stopPropagation()}>
                      <Menu.Root>
                        <Menu.Trigger
                          disabled={pendingRoleChangeId === member.id}
                          className={`flex cursor-pointer items-center gap-1 text-nowrap rounded-md px-2.5 py-1 text-xs font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60 ${roleStyles[member.role]}`}
                        >
                          {pendingRoleChangeId === member.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          {ROLE_LABELS[member.role]}
                        </Menu.Trigger>
                        <Menu.Portal>
                          <Menu.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
                            <Menu.Popup className="min-w-32 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                              {ROLE_OPTIONS.map((r) => (
                                <Menu.Item
                                  key={r}
                                  onClick={() => handleRoleChange(member, r)}
                                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-xs text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
                                >
                                  {ROLE_LABELS[r]}
                                </Menu.Item>
                              ))}
                            </Menu.Popup>
                          </Menu.Positioner>
                        </Menu.Portal>
                      </Menu.Root>
                    </td>
                    <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{member.department ?? '—'}</td>
                    <td className="py-3 pr-4 align-top">
                      <span className={`flex items-center gap-1.5 text-nowrap font-medium ${member.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top text-nowrap text-slate-300">
                      {member.lastActiveAt ? formatRelativeTime(member.lastActiveAt) : '—'}
                    </td>
                    <td className="py-3 align-top" onClick={(e) => e.stopPropagation()}>
                      <Menu.Root>
                        <Menu.Trigger aria-label="More actions" className="cursor-pointer text-slate-400 outline-none hover:text-white">
                          <MoreVertical className="h-4 w-4" />
                        </Menu.Trigger>
                        <Menu.Portal>
                          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
                            <Menu.Popup className="min-w-44 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                              <Menu.Item
                                onClick={() => handleToggleStatus(member)}
                                className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
                              >
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Menu.Item>
                              {!isYou && (
                                <Menu.Item
                                  onClick={() => setRemoveTarget(member)}
                                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-rose-400 outline-none transition-colors duration-300 data-highlighted:bg-rose-500/10"
                                >
                                  Remove from organization
                                </Menu.Item>
                              )}
                            </Menu.Popup>
                          </Menu.Positioner>
                        </Menu.Portal>
                      </Menu.Root>
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
          Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {(page - 1) * pageSize + rows.length} of {totalCount} users
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-2 text-sm text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={!!removeTarget} onOpenChange={(next) => !next && setRemoveTarget(null)}>
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-rose-400">Remove user?</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              This removes {removeTarget?.user.name} ({removeTarget?.user.email}) from your organization. They&apos;ll lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-rose-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
