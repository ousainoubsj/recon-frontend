'use client'

import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SupportContactCard from '@/components/dashboard/SupportContactCard'
import { BuildingIcon, ShieldCheckIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { PlatformRole } from '@/types/superAdmin'

// Links to the same tabs PlatformHome shows; the tab lives in ?tab= so both stay in step.
function PlatformNav({ platformRole }: { platformRole: PlatformRole }) {
  const isAdminsTab = useSearchParams().get('tab') === 'platform-admins'
  const items = [
    { label: 'Companies', href: '/dashboard', Icon: BuildingIcon, isActive: !isAdminsTab, isVisible: true },
    {
      label: 'Platform admins',
      href: '/dashboard?tab=platform-admins',
      Icon: ShieldCheckIcon,
      isActive: isAdminsTab,
      isVisible: platformRole === 'owner',
    },
  ]

  return (
    <nav className="mt-8 space-y-1">
      {items
        .filter((item) => item.isVisible)
        .map(({ label, href, Icon, isActive }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-white/5 text-[#1CEAEA]' : 'text-slate-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
    </nav>
  )
}

// Sidebar for a platform admin outside any company. The company Sidebar reads org settings, which they don't have.
export default function PlatformSidebar({ platformRole }: { platformRole: PlatformRole }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-[#232D47] bg-[#050F20] px-5 py-8 lg:flex">
      <Image src="/images/Reconcil-logo.png" alt="Reconcil" width={380} height={127} className="-ml-4 h-auto w-52" />

      <Suspense fallback={null}>
        <PlatformNav platformRole={platformRole} />
      </Suspense>

      <div className="mt-auto">
        <SupportContactCard />
      </div>
    </aside>
  )
}
