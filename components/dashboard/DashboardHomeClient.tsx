'use client'

import ActivityOverview from '@/components/dashboard/ActivityOverview'
import ChartsOverview from '@/components/dashboard/ChartsOverview'
import GreetingBanner from '@/components/dashboard/GreetingBanner'
import StatsOverview from '@/components/dashboard/StatsOverview'
import { useReports, useReportsSummary } from '@/lib/hooks/useReports'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'

export default function DashboardHomeClient() {
  const { data: summary, isLoading: isSummaryLoading } = useReportsSummary()
  const { data: reports, isLoading: isReportsLoading } = useReports({ limit: 6 })
  const { data: activity, isLoading: isActivityLoading } = useAuditLogs({ limit: 6 })

  return (
    <main className="flex-1 space-y-3 p-6">
      <GreetingBanner />
      <StatsOverview summary={summary} isLoading={isSummaryLoading} />
      <ChartsOverview />
      <ActivityOverview
        reports={reports}
        isReportsLoading={isReportsLoading}
        activity={activity}
        isActivityLoading={isActivityLoading}
      />
    </main>
  )
}
