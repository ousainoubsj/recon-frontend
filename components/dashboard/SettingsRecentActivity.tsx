import Image from 'next/image'
import { ArrowRight, Bell, FileText, LayoutGrid, MoreVertical } from 'lucide-react'

type Row = {
  action: string
  setting: string
  changedBy: string
  avatarBg: string
  initials: string
  src?: string
  date: string
  Icon: typeof FileText
  iconBg: string
  iconColor: string
}

const rows: Row[] = [
  {
    action: 'Updated default match tolerance',
    setting: 'Reconciliation Settings',
    changedBy: 'Amie J.',
    avatarBg: 'bg-teal-500',
    initials: 'AJ',
    date: 'Jun 30, 2026 10:24 AM',
    Icon: FileText,
    iconBg: 'bg-fuchsia-500/15',
    iconColor: 'text-fuchsia-400',
  },
  {
    action: 'Changed date format',
    setting: 'General Settings',
    changedBy: 'Ousainou J.',
    avatarBg: 'bg-slate-500',
    initials: 'OJ',
    src: '/ousainou.jpg',
    date: 'Jun 29, 2026 04:15 PM',
    Icon: FileText,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    action: 'Enabled email notifications',
    setting: 'Notifications',
    changedBy: 'Fatou S.',
    avatarBg: 'bg-amber-500',
    initials: 'FS',
    date: 'Jun 29, 2026 02:33 PM',
    Icon: Bell,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    action: 'Added Xero integration',
    setting: 'Integrations',
    changedBy: 'Amie J.',
    avatarBg: 'bg-teal-500',
    initials: 'AJ',
    date: 'Jun 28, 2026 11:08 AM',
    Icon: FileText,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    action: 'Updated organization information',
    setting: 'General Settings',
    changedBy: 'Ousainou J.',
    avatarBg: 'bg-slate-500',
    initials: 'OJ',
    src: '/ousainou.jpg',
    date: 'Jun 27, 2026 09:45 AM',
    Icon: LayoutGrid,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
]

export default function SettingsRecentActivity() {
  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent System Activity</h3>
          <p className="mt-1 text-sm text-slate-400">Latest changes made to system settings.</p>
        </div>
        <a href="#" className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:underline">
          View All Activity
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="pb-3 pr-4 text-nowrap font-semibold">Action</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Setting</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Changed By</th>
              <th className="pb-3 pr-4 text-nowrap font-semibold">Date &amp; Time</th>
              <th className="pb-3 text-nowrap font-semibold" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.action} className="border-t border-[#1B2540]">
                <td className="py-3 pr-4 align-top">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.iconBg} ${row.iconColor}`}>
                      <row.Icon className="h-4 w-4" />
                    </span>
                    <span className="text-nowrap text-slate-200">{row.action}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.setting}</td>
                <td className="py-3 pr-4 align-top">
                  <div className="flex items-center gap-2">
                    {row.src ? (
                      <Image src={row.src} alt={row.changedBy} width={24} height={24} className="h-6 w-6 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${row.avatarBg}`}>
                        {row.initials}
                      </span>
                    )}
                    <span className="text-nowrap text-slate-300">{row.changedBy}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{row.date}</td>
                <td className="py-3 align-top">
                  <button type="button" aria-label="More actions" className="cursor-pointer text-slate-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
