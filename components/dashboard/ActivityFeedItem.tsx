import Link from 'next/link'
import { Cog } from 'lucide-react'

import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import InitialsAvatar from '@/components/super-admin/InitialsAvatar'
import { actionDisplay, detailsForLog } from '@/lib/auditLogDisplay'
import { formatRelativeTime } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { cn } from '@/lib/utils'
import type { AuditLog, AuditLogStatus } from '@/types/auditLogs'

// Only problems get colour; success and info entries stay neutral.
const STATUS_CHIP: Partial<Record<AuditLogStatus, { label: string; className: string }>> = {
  failed: { label: 'Failed', className: 'bg-danger-solid/15 text-danger' },
  warning: { label: 'Warning', className: 'bg-warning-solid/15 text-warning' },
}

type ActivityFeedItemProps = {
  log: AuditLog
  // Own-activity feeds drop the avatar and actor name — every entry is the viewer's.
  showActor: boolean
  isLastInGroup: boolean
}

export default function ActivityFeedItem({ log, showActor, isLastInGroup }: ActivityFeedItemProps) {
  const { formatDateTime } = useOrgFormat()
  const { title, Icon, iconBg, iconColor } = actionDisplay(log)
  const subject = detailsForLog(log)[0]
  const actorName = log.user?.name ?? log.user?.email ?? 'System'
  const subtitle = showActor ? [actorName, subject].filter(Boolean).join(' · ') : subject
  const statusChip = STATUS_CHIP[log.status]
  // Deleted reports have no page left to open.
  const href = log.entityType === 'report' && log.entityId && !log.action.includes('delete')
    ? `/dashboard/reconciliation-process/${log.entityId}`
    : undefined

  const content = (
    <>
      <div className="relative shrink-0">
        {showActor ? (
          <>
            {log.user ? (
              <InitialsAvatar name={log.user.name} image={log.user.image} className="h-7 w-7 text-[10px]" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-overlay/15 text-fg-secondary">
                <Cog className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="absolute -right-1 -bottom-1 rounded-full bg-surface ring-2 ring-surface-sunken">
              <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', iconBg, iconColor)}>
                <Icon className="h-2.5 w-2.5" />
              </span>
            </span>
          </>
        ) : (
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', iconBg, iconColor)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <TruncateTooltip as="p" className="truncate text-sm font-medium text-fg-strong" tooltip={title}>
            {title}
          </TruncateTooltip>
          {statusChip && (
            <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium', statusChip.className)}>
              {statusChip.label}
            </span>
          )}
        </div>
        {subtitle && (
          <TruncateTooltip as="p" className="truncate text-xs text-fg-muted" tooltip={subtitle}>
            {subtitle}
          </TruncateTooltip>
        )}
      </div>

      <TruncateTooltip as="time" dateTime={log.ts} className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-fg-soft" tooltip={formatDateTime(log.ts)}>
        {formatRelativeTime(log.ts)}
      </TruncateTooltip>
    </>
  )

  const rowClassName = 'relative -mx-2 flex items-start gap-3 rounded-lg px-2 py-2'

  return (
    <li className="relative">
      {/* Timeline connector, centred under the 28px marker. */}
      {!isLastInGroup && <span aria-hidden className="absolute top-10 bottom-0 left-3.5 w-px bg-line" />}
      {href ? (
        <Link href={href} className={cn(rowClassName, 'transition-colors duration-200 hover:bg-overlay/5')}>
          {content}
        </Link>
      ) : (
        <div className={rowClassName}>{content}</div>
      )}
    </li>
  )
}
