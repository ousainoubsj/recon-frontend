import RecentActivityPanel from '@/components/dashboard/RecentActivityPanel'
import RecentReconciliationsPanel from '@/components/dashboard/RecentReconciliationsPanel'
import type { Report } from '@/types/reports'
import type { AuditLog } from '@/types/auditLogs'

type ActivityOverviewProps = {
  reports?: Report[]
  isReportsLoading?: boolean
  activity?: AuditLog[]
  isActivityLoading?: boolean
  isOwnActivity?: boolean
}

export default function ActivityOverview({
  reports,
  isReportsLoading,
  activity,
  isActivityLoading,
  isOwnActivity,
}: ActivityOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <RecentReconciliationsPanel reports={reports} isLoading={isReportsLoading} />
      <RecentActivityPanel activity={activity} isLoading={isActivityLoading} isOwnActivity={isOwnActivity} />
    </div>
  )
}
