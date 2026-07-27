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
  const { data: mostRecent } = useAuditLogs({ limit: 1 })
  const effectiveSelectedLog = selectedLog ?? mostRecent?.[0] ?? null

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <AuditHeader />
          <AuditStats />
          <AuditLogTable onSelectLog={setSelectedLog} />
        </div>

        <AuditSidebar selectedLog={effectiveSelectedLog} />
      </div>
    </div>
  )
}
