import Image from 'next/image'
import Link from 'next/link'
import { BarChart3, Clock, FileText, Settings, Users } from 'lucide-react'
import { DashboardIcon, PlusIcon } from '@/components/icons'

const navItems = [
  { label: 'History', Icon: Clock },
  { label: 'Reports', Icon: BarChart3 },
  { label: 'Audit Log', Icon: FileText },
  { label: 'Team', Icon: Users, badge: 'New' },
  { label: 'Settings', Icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#232D47] bg-[#050F20] px-5 py-8 lg:flex">
      <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} className="-ml-4 h-auto w-52" />

      <nav className="mt-8 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-[#1CEAEA]"
        >
          <DashboardIcon className="h-5 w-5" />
          Dashboard
        </Link>
      </nav>

      <Link
        href="/dashboard/reconcile"
        className="mt-4 flex items-center justify-start gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-80 active:scale-95"
      >
        <PlusIcon className="h-4 w-4" />
        New Reconciliation
      </Link>

      <nav className="mt-6 space-y-1">
        {navItems.map(({ label, Icon, badge }) => (
          <span
            key={label}
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
          >
            <Icon className="h-5 w-5" />
            {label}
            {badge && (
              <span className="ml-auto rounded-full bg-[#111743] px-2 py-0.5 text-[11px] font-semibold text-[#558ECD]">
                {badge}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-[#1E2A47] bg-[#0A1128] p-4">
        <div className="flex items-start gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111C3D]">
            <Image src="/icons/headphones.png" alt="" width={20} height={20} className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A1128]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Need support?</p>
            <p className="text-xs text-slate-400">We&apos;re here to help you.</p>
          </div>
        </div>
        <a
          href="mailto:support@reconcilepro.com"
          className="mt-3 block text-sm font-medium text-[#1CEAEA] hover:underline"
        >
          support@reconcilepro.com
        </a>
      </div>
    </aside>
  )
}
