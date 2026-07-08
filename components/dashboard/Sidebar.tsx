import Image from 'next/image'
import Link from 'next/link'
import { ClockIcon, DashboardIcon, DocumentIcon, ChartIcon, PeopleIcon, PlusIcon, SettingsIcon } from '@/components/icons'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', Icon: DashboardIcon, active: true },
  { label: 'History', Icon: ClockIcon },
  { label: 'Reports', Icon: ChartIcon },
  { label: 'Audit Log', Icon: DocumentIcon },
  { label: 'Team', Icon: PeopleIcon, badge: 'New' },
  { label: 'Settings', Icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col px-5 py-8 lg:flex">
      <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} className="-ml-1 h-auto w-44" />

      <Link
        href="#"
        className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
      >
        <PlusIcon className="h-4 w-4" />
        New Reconciliation
      </Link>

      <nav className="mt-6 space-y-1">
        {navItems.map(({ label, href, Icon, active, badge }) =>
          active && href ? (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-emerald-400"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ) : (
            <span
              key={label}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
            >
              <Icon className="h-5 w-5" />
              {label}
              {badge && (
                <span className="ml-auto rounded-full bg-indigo-500/20 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                  {badge}
                </span>
              )}
            </span>
          )
        )}
      </nav>
    </aside>
  )
}
