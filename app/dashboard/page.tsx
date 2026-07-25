'use client'

import ActivityOverview from '@/components/dashboard/ActivityOverview'
import ChartsOverview from '@/components/dashboard/ChartsOverview'
import GreetingBanner from '@/components/dashboard/GreetingBanner'
import StatsOverview from '@/components/dashboard/StatsOverview'
import { useReports, useReportsSummary, useReportsTrend } from '@/lib/hooks/useReports'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'

export default function Page() {
  const { data: summary, isLoading: isSummaryLoading } = useReportsSummary()
  const { data: trend, isLoading: isTrendLoading } = useReportsTrend()
  const { data: reports, isLoading: isReportsLoading } = useReports({ limit: 6 })
  const { data: activity, isLoading: isActivityLoading } = useAuditLogs({ limit: 6 })

  return (
    <main className="flex-1 space-y-3 p-6">
      <GreetingBanner />
      <StatsOverview summary={summary} isLoading={isSummaryLoading} />
      <ChartsOverview trend={trend} isLoading={isTrendLoading} />
      <ActivityOverview
        reports={reports}
        isReportsLoading={isReportsLoading}
        activity={activity}
        isActivityLoading={isActivityLoading}
      />
    </main>
  )
}
