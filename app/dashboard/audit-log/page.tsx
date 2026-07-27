'use client'

import { useState } from 'react'
import AuditHeader from '@/components/dashboard/AuditHeader'
import AuditLogTable from '@/components/dashboard/AuditLogTable'
import AuditSidebar from '@/components/dashboard/AuditSidebar'
import AuditStats from '@/components/dashboard/AuditStats'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'
import type { AuditLog } from '@/types/auditLogs'

export default function Page() {
  const [selectedLog, setSelectedLog] = useState<AuditLog | undefined>(undefined)
  // Defaults the sidebar's "Log Details" card to the most recent activity
  // before anything's been clicked — same "always show something sensible"
  // convention as Team's user-details panel.
  const { data: mostRecent, isLoading: isMostRecentLoading } = useAuditLogs({ limit: 1 })
  const effectiveSelectedLog = selectedLog ?? mostRecent?.[0] ?? null
  // Only relevant before anything's been explicitly clicked — once the user
  // picks a row, selectedLog is set synchronously with no fetch involved.
  const isSelectedLogLoading = selectedLog === undefined && isMostRecentLoading

  // Bumped by AuditSidebar's "View All Actions" link (there's no separate
  // "all actions" page — the table right here already shows every action) to
  // trigger a scroll-into-view + brief highlight on AuditLogTable.
  const [highlightTableSignal, setHighlightTableSignal] = useState(0)

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <AuditHeader />
          <AuditStats />
          <AuditLogTable onSelectLog={setSelectedLog} highlightSignal={highlightTableSignal} />
        </div>

        <AuditSidebar
          selectedLog={effectiveSelectedLog}
          isSelectedLogLoading={isSelectedLogLoading}
          onViewAllActions={() => setHighlightTableSignal((n) => n + 1)}
        />
      </div>
    </div>
  )
}
