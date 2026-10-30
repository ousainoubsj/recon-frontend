'use client'

import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useExitCompany } from '@/lib/hooks/useSuperAdmin'
import InitialsAvatar from './InitialsAvatar'

// StaffLedger's impersonation bar, in Reconcil's colours. Shown under the header on every page while inside a company.
export default function SupportBanner({ companyName }: { companyName: string }) {
  const { data: session } = useSession()
  const exitCompany = useExitCompany()

  return (
    <div className="flex w-full items-center justify-between gap-3 border-y border-[#232D47] bg-[#0E182D] px-6 py-2 text-sm text-white shadow-sm">
      <div className="flex items-center gap-2">
        <InitialsAvatar name={session?.user.name ?? ''} image={session?.user.image} />
        <span>
          Acting as <span className="font-semibold text-[#1CEAEA]">{companyName}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => exitCompany.mutate()}
        disabled={exitCompany.isPending}
        className="flex h-7 cursor-pointer items-center gap-0.5 rounded-full bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-4 font-normal text-white transition-all duration-300 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exitCompany.isPending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
        {exitCompany.isPending ? 'Exiting...' : 'Exit impersonation'}
      </button>
    </div>
  )
}
