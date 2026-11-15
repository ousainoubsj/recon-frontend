'use client'

import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS, ROLE_OPTIONS, type MemberRole, type MemberStatus } from '@/types/team'

type TeamFiltersProps = {
  q: string
  onQChange: (q: string) => void
  role: MemberRole | 'all'
  onRoleChange: (role: MemberRole | 'all') => void
  status: MemberStatus | 'all'
  onStatusChange: (status: MemberStatus | 'all') => void
}

export default function TeamFilters({ q, onQChange, role, onRoleChange, status, onStatusChange }: TeamFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="search"
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Search by name, email..."
          className="w-full rounded-lg border border-line bg-surface/60 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <Select
        value={role}
        onValueChange={(value) => onRoleChange(value as MemberRole | 'all')}
        items={{ all: 'All Roles', ...ROLE_LABELS }}
      >
        <SelectTrigger className="h-9! w-fit cursor-pointer border-line bg-surface text-sm text-fg-strong">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {ROLE_OPTIONS.map((r) => (
            <SelectItem key={r} value={r}>
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as MemberStatus | 'all')}
        items={{ all: 'All Status', active: 'Active', inactive: 'Inactive' }}
      >
        <SelectTrigger className="h-9! w-fit cursor-pointer border-line bg-surface text-sm text-fg-strong">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
