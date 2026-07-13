'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, HelpCircle, Search } from 'lucide-react'
import ReconciliationStepper from '@/components/dashboard/reconcile/ReconciliationStepper'

export default function Header() {
  const pathname = usePathname()
  const isReconciliationProcess = pathname === '/dashboard/reconciliation-process'

  return (
    <header className="bg-[#050F20]">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {isReconciliationProcess ? (
          <ReconciliationStepper />
        ) : (
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>
        )}

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors duration-300 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
            Need help?
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative cursor-pointer text-slate-400 transition-colors duration-300 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1CEAEA] text-[10px] font-semibold text-[#050F20]">
              3
            </span>
          </button>

          <button type="button" className="flex cursor-pointer items-center gap-2">
            <Image
              src="/ousainou.jpg"
              alt="Ousainou J."
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="text-left leading-tight">
              <span className="block text-sm font-semibold text-white">Ousainou Jammeh</span>
              <span className="block text-xs text-slate-400">Administrator</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="mx-6 border-b border-[#232D47]" />
    </header>
  )
}
