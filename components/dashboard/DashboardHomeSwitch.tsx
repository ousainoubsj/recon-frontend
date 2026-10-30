'use client'

import { Suspense } from 'react'
import DashboardHomeClient from '@/components/dashboard/DashboardHomeClient'
import PlatformHome from '@/components/super-admin/PlatformHome'
import { usePlatformSession } from '@/lib/hooks/useSuperAdmin'

// /dashboard is the companies list for a platform admin outside any company, as in StaffLedger.
export default function DashboardHomeSwitch() {
  const { data: platform } = usePlatformSession()
  if (platform?.platformRole && !platform.supportCompany) {
    return (
      <Suspense fallback={null}>
        <PlatformHome platformRole={platform.platformRole} />
      </Suspense>
    )
  }
  return <DashboardHomeClient />
}
