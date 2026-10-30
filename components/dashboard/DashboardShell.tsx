'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import PlatformSidebar from '@/components/super-admin/PlatformSidebar'
import SupportBanner from '@/components/super-admin/SupportBanner'
import { LogoLoader } from '@/components/ui/logo-loader'
import { useSession } from '@/lib/auth-client'
import { usePlatformSession } from '@/lib/hooks/useSuperAdmin'

// Authoritative session check — proxy.ts's cookie-presence check is only
// optimistic (can't cheaply call the separate Express backend on the edge).
// useSession() also revalidates reactively on window focus, covering the
// "session expired while the tab was open" case proxy.ts can't.
//
// Split out of app/dashboard/layout.tsx (a Server Component) so that file
// can export `metadata` — the `metadata` export is only supported in Server
// Components, and this shell needs client-side hooks (useSession, useRouter).
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = useSession()
  const { data: platform, isLoading: isPlatformLoading } = usePlatformSession()
  // A platform admin outside any company has no org: /dashboard shows them the companies list, nothing else applies.
  const platformRole = platform?.supportCompany ? undefined : (platform?.platformRole ?? undefined)
  const isOffPlatformHome = !!platformRole && pathname !== '/dashboard'

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/')
    }
  }, [isPending, session, router])

  useEffect(() => {
    if (isOffPlatformHome) router.replace('/dashboard')
  }, [isOffPlatformHome, router])

  if (isPending || !session || isPlatformLoading || isOffPlatformHome) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050F20]">
        <LogoLoader />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050F20]">
      {platformRole ? <PlatformSidebar platformRole={platformRole} /> : <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header platformRole={platformRole} />
        {platform?.supportCompany && <SupportBanner companyName={platform.supportCompany.name} />}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
