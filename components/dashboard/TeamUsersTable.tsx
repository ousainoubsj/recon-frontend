'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu } from '@base-ui/react/menu'
import { Check, ChevronLeft, ChevronRight, Loader2, MoreHorizontal, MoreVertical } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/lib/toast'
import { useRemoveMember, useUpdateMember, useUpdateMemberRole } from '@/lib/hooks/useTeam'
import { formatTimeAgo } from '@/lib/format'
import { getPageItems } from '@/lib/pagination'
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
  admin: 'bg-accent-indigo-solid/15 text-accent-indigo-soft',
  analyst: 'bg-success-solid/15 text-success-soft',
  viewer: 'bg-slate-500/15 text-fg-secondary',
}

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-line bg-surface-sunken checked:border-brand checked:bg-brand"
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-brand-foreground opacity-0 peer-checked:opacity-100" />
    </span>
  )
}

function EmptyTeamMembers() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyUsersGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <rect x="16" y="10" width="66" height="58" rx="8" fill="var(--surface-active)" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="34" cy="30" r="8" fill="var(--illus-1)" />
        <rect x="24" y="44" width="20" height="3" rx="1.5" fill="var(--illus-2)" />
        <rect x="24" y="50" width="14" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="64" cy="30" r="8" fill="var(--brand)" fillOpacity="0.4" />
        <rect x="54" y="44" width="20" height="3" rx="1.5" fill="var(--illus-1)" />
        <rect x="54" y="50" width="14" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="80" cy="66" r="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="77" cy="63" r="6" stroke="url(#emptyUsersGlow)" strokeWidth="2" fill="none" />
        <line x1="81.5" y1="67.5" x2="86" y2="72" stroke="url(#emptyUsersGlow)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-sm font-medium text-fg-strong">No team members match these filters</p>
        <p className="mt-1 text-xs text-fg-muted">Try a different search term or clear the role/status filters.</p>
      </div>
    </div>
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
  const updateMember = useUpdateMember()
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null)
  const updateMemberRole = useUpdateMemberRole()
  const removeMember = useRemoveMember()
  const pendingRoleChangeId = updateMemberRole.isPending ? updateMemberRole.variables?.id : undefined
  const isRemoving = removeMember.isPending

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

  const handleRoleChange = (member: TeamMember, role: MemberRole) => {
    if (role === member.role) return
    updateMemberRole.mutate({ id: member.id, role }, { onSuccess: () => toast.success('Role updated') })
  }

  const handleToggleStatus = (member: TeamMember) => {
    updateMember.mutate(
      { id: member.id, data: { status: member.status === 'active' ? 'inactive' : 'active' } },
      { onSuccess: () => toast.success(member.status === 'active' ? 'User deactivated' : 'User activated') },
    )
  }

  const handleRemove = () => {
    if (!removeTarget) return
    removeMember.mutate(removeTarget.id, {
      onSuccess: () => {
        toast.success('User removed')
        setRemoveTarget(null)
      },
    })
  }

  if (isLoading || !members) {
    return (
      <div className="min-w-0 rounded-2xl border border-line bg-surface-raised/10 p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-fg-muted">
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
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i} className="border-t border-line-subtle">
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
    <div className="min-w-0 rounded-2xl border border-line bg-surface-raised/10 p-4">
      <ScrollArea className="min-w-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-fg-muted">
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
                <td colSpan={8}>
                  <EmptyTeamMembers />
                </td>
              </tr>
            ) : (
              rows.map((member) => {
                const isYou = member.userId === currentUserId
                return (
                  <tr
                    key={member.id}
                    onClick={() => onSelect?.(member.id)}
                    className="cursor-pointer rounded-md border-t border-line-subtle hover:bg-overlay/3"
                  >
                    <td className="py-3 pr-3 align-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(member.id)} onChange={() => toggleRow(member.id)} ariaLabel={`Select ${member.user.name}`} />
                    </td>
                    <td className="max-w-44 py-2 pr-4 align-top">
                      <div className="flex items-center gap-2.5">
                        {member.user.image ? (
                          <Image
                            src={member.user.image}
                            alt={member.user.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500 text-xs font-semibold text-white">
                            {member.user.name
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        )}
                        <div className="flex min-w-0 items-center gap-2">
                          <TruncateTooltip as="p" className="truncate font-medium text-foreground" tooltip={member.user.name}>
                            {member.user.name}
                          </TruncateTooltip>
                          {isYou && (
                            <span className="shrink-0 rounded-md bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-hue-violet-soft">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-48 py-3 pr-4 align-top">
                      <TruncateTooltip as="p" className="truncate text-fg-secondary" tooltip={member.user.email}>
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
                          {pendingRoleChangeId === member.id ? 'Updating...' : ROLE_LABELS[member.role]}
                        </Menu.Trigger>
                        <Menu.Portal>
                          <Menu.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
                            <Menu.Popup className="min-w-32 rounded-lg border border-line bg-surface shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                              {ROLE_OPTIONS.map((r) => (
                                <Menu.Item
                                  key={r}
                                  onClick={() => handleRoleChange(member, r)}
                                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-xs text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                                >
                                  {ROLE_LABELS[r]}
                                </Menu.Item>
                              ))}
                            </Menu.Popup>
                          </Menu.Positioner>
                        </Menu.Portal>
                      </Menu.Root>
                    </td>
                    <td className="py-3 pr-4 align-top text-nowrap text-fg-secondary">{member.department ?? '—'}</td>
                    <td className="py-3 pr-4 align-top">
                      <span className={`flex items-center gap-1.5 text-nowrap font-medium ${member.status === 'active' ? 'text-success' : 'text-warning'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-top text-nowrap text-fg-secondary">
                      {member.lastActiveAt ? formatTimeAgo(member.lastActiveAt) : '—'}
                    </td>
                    <td className="py-3 align-center" onClick={(e) => e.stopPropagation()}>
                      <Menu.Root>
                        <Menu.Trigger aria-label="More actions" className="cursor-pointer text-fg-muted outline-none hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Menu.Trigger>
                        <Menu.Portal>
                          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
                            <Menu.Popup className="min-w-44 rounded-lg border border-line bg-surface shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                              <Menu.Item
                                onClick={() => onSelect?.(member.id)}
                                className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                              >
                                View Details
                              </Menu.Item>
                              {isAdmin && !isYou && (
                                <>
                                  <Menu.Item
                                    onClick={() => handleToggleStatus(member)}
                                    className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                                  >
                                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </Menu.Item>
                                  <Menu.Item
                                    onClick={() => setRemoveTarget(member)}
                                    className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-danger outline-none transition-colors duration-300 data-highlighted:bg-danger-solid/10"
                                  >
                                    Remove from organization
                                  </Menu.Item>
                                </>
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

      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-sm text-fg-muted">
          Showing {rows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {(page - 1) * pageSize + rows.length} of {totalCount} users
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-overlay/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {getPageItems(page, totalPages).map((item, i) =>
            item === '...' ? (
              <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-fg-subtle">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                  page === item ? 'bg-accent-indigo-solid text-white' : 'text-fg-secondary hover:bg-overlay/5'
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-overlay/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <span className="rounded-md border border-line px-3 py-1.5 text-sm text-fg-secondary">{pageSize} / page</span>
      </div>

      <Dialog open={!!removeTarget} onOpenChange={(next) => !next && setRemoveTarget(null)}>
        <DialogContent className="border border-line bg-surface-raised p-3.5 text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-danger">Remove user?</DialogTitle>
            <DialogDescription className="text-sm text-fg-muted">
              This removes {removeTarget?.user.name} ({removeTarget?.user.email}) from your organization. They&apos;ll lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              className="cursor-pointer border-line bg-transparent p-4 text-foreground transition-all duration-300 hover:bg-overlay/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-danger-solid p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRemoving ? 'Removing member...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
