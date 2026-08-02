'use client'

import { useState } from 'react'
import RecentExports from '@/components/dashboard/RecentExports'
import ReportBuilder from '@/components/dashboard/ReportBuilder'
import ReportPreviewCard from '@/components/dashboard/ReportPreviewCard'
import ReportsHeader from '@/components/dashboard/ReportsHeader'
import ReportTemplates from '@/components/dashboard/ReportTemplates'
import { useReports } from '@/lib/hooks/useReports'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'
import { decorateTemplates, DEFAULT_TEMPLATE_NAME, CUSTOM_TEMPLATE_ID } from '@/lib/reportTemplateDecorations'

// Owns the two IDs shared between the template strip, the builder's pickers,
// and the preview card — everything else (format/customize toggles, dialog
// open state) stays local to ReportBuilder since nothing else needs it.
// RecentExports/ReportsHeader don't need this state, just co-located here
// since the shared state has to live in a client component and the grid
// layout is easiest to keep in one place.
export default function ReportsWorkspace() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  // No reconciliation explicitly picked yet → default to the most recently
  // completed one, so the preview is never empty on first load.
  const { data: recentReports, isLoading: isRecentReportsLoading } = useReports({ status: 'completed', limit: 1 })
  const effectiveReportId = selectedReportId ?? recentReports?.[0]?.id ?? null
  // Only the initial auto-select can still be in flight — once the user
  // explicitly picks a reconciliation, effectiveReportId no longer depends
  // on this query.
  const isResolvingReportId = selectedReportId === null && isRecentReportsLoading

  // No template explicitly picked yet → default to "Reconciliation Summary"
  // (matches the mock's original hardcoded `selected: true`), not Custom.
  const { data: templates } = useReportTemplates()
  const decorated = decorateTemplates(templates)
  const defaultTemplateId = decorated.find((t) => t.name === DEFAULT_TEMPLATE_NAME)?.id ?? CUSTOM_TEMPLATE_ID
  const effectiveTemplateId = selectedTemplateId ?? defaultTemplateId
  const effectiveTemplateName = decorated.find((t) => t.id === effectiveTemplateId)?.name ?? null

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
      <div className="min-w-0 space-y-6">
        <ReportsHeader />
        <ReportTemplates selectedTemplateId={effectiveTemplateId} onSelect={setSelectedTemplateId} />
        <RecentExports />
      </div>

      <div className="flex flex-col gap-3">
        <ReportBuilder
          selectedReportId={effectiveReportId}
          onSelectReport={setSelectedReportId}
          selectedTemplateId={effectiveTemplateId}
          onSelectTemplate={setSelectedTemplateId}
        />
        <ReportPreviewCard
          reportId={effectiveReportId}
          templateId={effectiveTemplateId}
          templateName={effectiveTemplateName}
          isResolvingReportId={isResolvingReportId}
        />
      </div>
    </div>
  )
}
