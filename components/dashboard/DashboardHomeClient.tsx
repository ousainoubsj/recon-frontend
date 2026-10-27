'use client'

import ActivityOverview from '@/components/dashboard/ActivityOverview'
import ChartsOverview from '@/components/dashboard/ChartsOverview'
import GreetingBanner from '@/components/dashboard/GreetingBanner'
import StatsOverview from '@/components/dashboard/StatsOverview'
import { useReports, useReportsSummary } from '@/lib/hooks/useReports'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'
import { authClient } from '@/lib/auth-client'

export default function DashboardHomeClient() {
  const { data: summary, isLoading: isSummaryLoading } = useReportsSummary()
  const { data: reports, isLoading: isReportsLoading } = useReports({ limit: 6 })
  // Waits for the role so a non-admin never requests the admin-only org feed.
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isAdmin = activeMemberRole?.role === 'admin'
  const { data: activity, isPending: isActivityPending } = useAuditLogs(
    { limit: 6 },
    { scope: isAdmin ? 'org' : 'mine', enabled: !!activeMemberRole },
  )

  return (
    <main className="flex-1 space-y-3 p-6">
      <GreetingBanner />
      <StatsOverview summary={summary} isLoading={isSummaryLoading} />
      <ChartsOverview />
      <ActivityOverview
        reports={reports}
        isReportsLoading={isReportsLoading}
        activity={activity}
        isActivityLoading={isActivityPending}
        isOwnActivity={!isAdmin}
      />
    </main>
  )
}
