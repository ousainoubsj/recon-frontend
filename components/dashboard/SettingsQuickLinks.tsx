import { Bell, ChevronRight, CloudBackup, Link2, Users } from 'lucide-react'

const links = [
  { label: 'Manage Users', description: 'Add and manage team members', Icon: Users },
  { label: 'Manage Integrations', description: 'Connect and manage apps', Icon: Link2 },
  { label: 'Notification Settings', description: 'Configure email and alerts', Icon: Bell },
  { label: 'Backup & Restore', description: 'Manage data backups', Icon: CloudBackup },
]

export default function SettingsQuickLinks() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Quick Links</h3>

      <div className="mt-1">
        {links.map(({ label, description, Icon }) => (
          <button
            key={label}
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 py-2 text-left transition-colors hover:bg-white/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-300">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{label}</span>
              <span className="block truncate text-xs text-slate-400">{description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  )
}
