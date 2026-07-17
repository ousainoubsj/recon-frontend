import Image from 'next/image'
import {
  Briefcase,
  CalendarCheck,
  CircleChevronDown,
  Clock,
  Crown,
  FileChartColumn,
  FileText,
  Lock,
  Pencil,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react'

const details = [
  { label: 'Department', value: 'IT', Icon: Briefcase },
  { label: 'Joined', value: 'Jan 12, 2024', Icon: CalendarCheck },
  { label: 'Last Active', value: 'Just now', Icon: Clock },
]

const permissions = [
  { label: 'Reconciliations', Icon: Briefcase },
  { label: 'Reports & Export', Icon: FileChartColumn },
  { label: 'Audit Log', Icon: FileText },
  { label: 'User Management', Icon: Users },
  { label: 'Settings', Icon: Settings },
]

export default function TeamUserDetails() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#070F1C]/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">User Details</h3>
          <div className="mt-2 h-px w-24 bg-[#232D47]" />
        </div>
        <button type="button" aria-label="Close" className="cursor-pointer text-slate-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3 border-b border-[#232D47] pb-5">
        <Image src="/ousainou.jpg" alt="Ousainou J." width={64} height={64} className="h-16 w-16 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">Ousainou J.</p>
            <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">Administrator</span>
          </div>
          <p className="mt-1 truncate text-sm text-slate-400">ousainou.j@reconcilepro.com</p>
        </div>
      </div>

      <div className="space-y-3.5 border-b border-[#232D47] py-5">
        {details.map(({ label, value, Icon }) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2.5 text-slate-300">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              {label}
            </span>
            <span className="text-slate-200">{value}</span>
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2.5 text-slate-300">
            <CircleChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            Status
          </span>
          <span className="flex items-center gap-1.5 text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        </div>

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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Crown className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-white">Administrator</p>
            <p className="text-sm text-slate-400">Full access to all modules and settings.</p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#232D47]">
          {permissions.map(({ label, Icon }) => (
            <div key={label} className="flex items-center justify-between gap-3 px-1 py-3 text-sm">
              <span className="flex items-center gap-2.5 text-slate-300">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                {label}
              </span>
              <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">All Access</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-indigo-500/50 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-95"
        >
          <Pencil className="h-4 w-4" />
          Edit User
        </button>

        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
          Deactivate User
        </button>
      </div>
    </div>
  )
}
