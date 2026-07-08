import Image from 'next/image'
import Link from 'next/link'
import { GridIcon, LogoutIcon, SettingsIcon, SwapIcon } from '@/components/icons'

const navItems = [
  { label: 'Overview', href: '/dashboard', Icon: GridIcon, active: true },
  { label: 'Transactions', Icon: SwapIcon, active: false },
  { label: 'Settings', Icon: SettingsIcon, active: false },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-slate-950 px-5 py-8 lg:flex">
      <div>
        <Image src="/images/logo-sym.png" alt="Reconcil" width={36} height={36} className="ml-1 h-9 w-auto" />

        <nav className="mt-10 space-y-1">
          {navItems.map(({ label, href, Icon, active }) =>
            active && href ? (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium text-white"
              >
                <Icon className="h-5 w-5 text-emerald-400" />
                {label}
              </Link>
            ) : (
              <span
                key={label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500"
              >
                <Icon className="h-5 w-5" />
                {label}
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Soon
                </span>
              </span>
            )
          )}
        </nav>
      </div>

      <Link
        href="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-300 hover:bg-white/5 hover:text-white"
      >
        <LogoutIcon className="h-5 w-5" />
        Sign out
      </Link>
    </aside>
  )
}
