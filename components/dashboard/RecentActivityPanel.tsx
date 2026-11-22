import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import ActivityFeedItem from '@/components/dashboard/ActivityFeedItem'
import EmptyActivity from '@/components/dashboard/EmptyActivity'
import PanelHeader from '@/components/dashboard/PanelHeader'
import type { AuditLog } from '@/types/auditLogs'

type RecentActivityPanelProps = {
  activity?: AuditLog[]
  isLoading?: boolean
  // Non-admins see only their own entries, and the audit log page isn't theirs to open.
  isOwnActivity?: boolean
}

type DayGroup = { label: string; logs: AuditLog[] }

// Days are the viewer's local calendar days — this is display grouping, not a business date.
function dayLabel(ts: string) {
  const day = new Date(ts).toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (day === new Date().toDateString()) return 'Today'
  if (day === yesterday.toDateString()) return 'Yesterday'
  return 'Earlier'
}

export default function RecentActivityPanel({ activity, isLoading, isOwnActivity }: RecentActivityPanelProps) {
  // The feed arrives newest first, so each label's entries are contiguous.
  const groups: DayGroup[] = []
  for (const log of activity ?? []) {
    const label = dayLabel(log.ts)
    const current = groups.at(-1)
    if (current?.label === label) current.logs.push(log)
    else groups.push({ label, logs: [log] })
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-sunken/50 p-4">
      {isOwnActivity ? (
        <PanelHeader title="Your Recent Activity" />
      ) : (
        <PanelHeader title="Recent Activity" viewAllHref="/dashboard/audit-log" />
      )}

      <ScrollArea className="h-82 w-full">
        {isLoading || !activity ? (
          <ul className="space-y-1 pt-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start gap-3 py-2">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-12 shrink-0" />
              </li>
            ))}
          </ul>
        ) : activity.length === 0 ? (
          <EmptyActivity />
        ) : (
          <div className="space-y-3 pt-1">
            {groups.map((group) => (
              <section key={group.label}>
                <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-soft">{group.label}</h4>
                <ul>
                  {group.logs.map((log, index) => (
                    <ActivityFeedItem
                      key={log.id}
                      log={log}
                      showActor={!isOwnActivity}
                      isLastInGroup={index === group.logs.length - 1}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
