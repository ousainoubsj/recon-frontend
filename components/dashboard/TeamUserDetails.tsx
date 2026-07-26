'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Briefcase,
  CalendarCheck,
  CircleChevronDown,
  Clock,
  Crown,
  FileChartColumn,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Settings,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { authClient } from '@/lib/auth-client'
import { useUpdateMember } from '@/lib/hooks/useTeam'
import { formatDate, formatTimeAgo } from '@/lib/format'
import { ROLE_LABELS, type MemberRole, type TeamMember } from '@/types/team'

type TeamUserDetailsProps = {
  member?: TeamMember | null
  isLoading?: boolean
}

type AccessLevel = 'Full Access' | 'View Only' | 'No Access'

// Mirrors recon-backend/services/permissions.js's ROLE_PERMISSIONS exactly —
// no endpoint exposes this, so it's a maintained frontend copy for display
// only. Update both together if the backend's role grants ever change.
const ROLE_INFO: Record<
  MemberRole,
  { description: string; Icon: LucideIcon; tint: string; permissions: { label: string; Icon: LucideIcon; access: AccessLevel }[] }
> = {
  admin: {
    description: 'Full access to all modules and settings.',
    Icon: Crown,
    tint: 'bg-amber-500/15 text-amber-400',
    permissions: [
      { label: 'Reconciliations', Icon: Briefcase, access: 'Full Access' },
      { label: 'Reports & Export', Icon: FileChartColumn, access: 'Full Access' },
      { label: 'Audit Log', Icon: FileText, access: 'Full Access' },
      { label: 'User Management', Icon: Users, access: 'Full Access' },
      { label: 'Settings', Icon: Settings, access: 'Full Access' },
    ],
  },
  analyst: {
    description: 'Can create, run, and export reconciliations; limited admin access.',
    Icon: Briefcase,
    tint: 'bg-emerald-500/15 text-emerald-400',
    permissions: [
      { label: 'Reconciliations', Icon: Briefcase, access: 'Full Access' },
      { label: 'Reports & Export', Icon: FileChartColumn, access: 'Full Access' },
      { label: 'Audit Log', Icon: FileText, access: 'No Access' },
      { label: 'User Management', Icon: Users, access: 'View Only' },
      { label: 'Settings', Icon: Settings, access: 'View Only' },
    ],
  },
  viewer: {
    description: 'Read-only access to reports and organization info.',
    Icon: Lock,
    tint: 'bg-slate-500/15 text-slate-400',
    permissions: [
      { label: 'Reconciliations', Icon: Briefcase, access: 'No Access' },
      { label: 'Reports & Export', Icon: FileChartColumn, access: 'Full Access' },
      { label: 'Audit Log', Icon: FileText, access: 'No Access' },
      { label: 'User Management', Icon: Users, access: 'View Only' },
      { label: 'Settings', Icon: Settings, access: 'View Only' },
    ],
  },
}

const accessTint: Record<AccessLevel, string> = {
  'Full Access': 'bg-emerald-500/10 text-emerald-300',
  'View Only': 'bg-white/5 text-slate-300',
  'No Access': 'bg-white/5 text-slate-500',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TeamUserDetails({ member, isLoading }: TeamUserDetailsProps) {
  const updateMember = useUpdateMember()
  const { data: session } = authClient.useSession()
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'
  const [isEditingDepartment, setIsEditingDepartment] = useState(false)
  const [departmentDraft, setDepartmentDraft] = useState('')

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#232D47] bg-[#070F1C]/40 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">User Details</h3>
          <div className="mt-2 h-px w-24 bg-[#232D47]" />
        </div>

        <div className="mt-4 flex items-center gap-3 border-b border-[#232D47] pb-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <div className="space-y-6.5 border-b border-[#232D47] py-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>

        <div className="border-b border-[#232D47] pt-5">
          <Skeleton className="h-4 w-36" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="mt-4 space-y-3 divide-y divide-[#232D47]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-1 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!member) return null

  const roleInfo = ROLE_INFO[member.role]

  const startEditingDepartment = () => {
    setDepartmentDraft(member.department ?? '')
    setIsEditingDepartment(true)
  }

  const saveDepartment = () => {
    updateMember.mutate(
      { id: member.id, data: { department: departmentDraft.trim() || null } },
      { onSuccess: () => setIsEditingDepartment(false) },
    )
  }

  const handleToggleStatus = () => {
    updateMember.mutate({ id: member.id, data: { status: member.status === 'active' ? 'inactive' : 'active' } })
  }

  const details = [
    { label: 'Department', value: member.department ?? '—', Icon: Briefcase },
    { label: 'Joined', value: formatDate(member.createdAt), Icon: CalendarCheck },
    { label: 'Last Active', value: member.lastActiveAt ? formatTimeAgo(member.lastActiveAt) : 'Never', Icon: Clock },
  ]

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#070F1C]/40 p-4">
      <div>
        <h3 className="text-base font-semibold text-white">User Details</h3>
        <div className="mt-2 h-px w-24 bg-[#232D47]" />
      </div>

      <div className="mt-4 flex items-center gap-3 border-b border-[#232D47] pb-5">
        {member.user.image ? (
          <Image
            src={member.user.image}
            alt={member.user.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-500 text-lg font-semibold text-white">
            {initials(member.user.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-white">{member.user.name}</p>
          <p className="mt-1 truncate text-sm text-slate-400">{member.user.email}</p>
        </div>
      </div>

      <div className="space-y-6.5 border-b border-[#232D47] py-5">
        {details.map(({ label, value, Icon }) =>
          label === 'Department' && isEditingDepartment ? (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2.5 text-slate-300">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {label}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={departmentDraft}
                  onChange={(e) => setDepartmentDraft(e.target.value)}
                  className="w-28 rounded-md border border-[#232D47] bg-[#0A1128] px-2 py-1 text-xs text-white focus:border-[#1CEAEA] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveDepartment}
                  disabled={updateMember.isPending}
                  className="cursor-pointer text-xs font-medium text-emerald-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateMember.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2.5 text-slate-300">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {label}
              </span>
              <span className="text-slate-200">{value}</span>
            </div>
          ),
        )}

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2.5 text-slate-300">
            <CircleChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            Status
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className={`h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {member.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* No 2FA backend exists — this stays a static display value, since
            the OTP-based signup/email-verification flow already covers the
            spirit of it (explicit product decision, not an oversight). */}
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2.5 text-slate-300">
            <Lock className="h-4 w-4 shrink-0 text-slate-400" />
            2FA Enabled
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Yes
          </span>
        </div>
      </div>

      <div className="border-b border-[#232D47] pt-5">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-slate-300" />
          <h3 className="text-base font-semibold text-white">Role &amp; Permissions</h3>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${roleInfo.tint}`}>
            <roleInfo.Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-white">{ROLE_LABELS[member.role]}</p>
            <p className="text-sm text-slate-400">{roleInfo.description}</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#232D47]">
          {roleInfo.permissions.map(({ label, Icon, access }) => (
            <div key={label} className="flex items-center justify-between gap-3 px-1 py-3 text-sm">
              <span className="flex items-center gap-2.5 text-slate-300">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {label}
              </span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${accessTint[access]}`}>{access}</span>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-5 space-y-3">
          {isAdmin && (
            <button
              type="button"
              onClick={startEditingDepartment}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-indigo-500/50 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-95"
            >
              <Pencil className="h-4 w-4" />
              Edit User
            </button>
          )}

          {isAdmin && member.userId !== session?.user.id && (
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={updateMember.isPending}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMember.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {member.status === 'active' ? 'Deactivate User' : 'Activate User'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
