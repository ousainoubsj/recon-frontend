'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import RecentExports from '@/components/dashboard/RecentExports'
import ReportBuilder from '@/components/dashboard/ReportBuilder'
import ReportPreviewCard from '@/components/dashboard/ReportPreviewCard'
import ReportsHeader from '@/components/dashboard/ReportsHeader'
import ReportTemplates from '@/components/dashboard/ReportTemplates'
import { useReports } from '@/lib/hooks/useReports'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'
import {
  decorateTemplates,
  DEFAULT_TEMPLATE_NAME,
  CUSTOM_TEMPLATE_ID,
  COMBINED_TEMPLATE_ID,
  DEFAULT_CUSTOMIZE,
  type CustomizeKey,
} from '@/lib/reportTemplateDecorations'
import type { ReportSections } from '@/types/reports'

// Owns the two IDs shared between the template strip, the builder's pickers,
// and the preview card, plus the custom-sections toggles — the preview card
// needs the same sections the builder would export, or "Preview Full
// Report" under Custom silently ignores whatever was toggled. Everything
// else (format, dialog open state) stays local to ReportBuilder since
// nothing else needs it. RecentExports/ReportsHeader don't need this state,
// just co-located here since the shared state has to live in a client
// component and the grid layout is easiest to keep in one place.
function ReportsWorkspaceInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  // Only meaningful when Combined Report is the active template — a
  // separate array rather than overloading selectedReportId, since the two
  // templates need genuinely different selection shapes (one report vs
  // several) and switching between them shouldn't have to reconcile a
  // single-vs-multi representation.
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [customize, setCustomize] = useState<Record<CustomizeKey, boolean>>(DEFAULT_CUSTOMIZE)

  // Deep-linked from elsewhere (e.g. Results' "Export Results" quick action)
  // with a specific reconciliation to preselect — consume once, then strip
  // the param so it doesn't stick around after a refresh/back navigation.
  useEffect(() => {
    const reportId = searchParams.get('reportId')
    if (reportId) {
      setSelectedReportId(reportId)
      router.replace('/dashboard/reports')
    }
  }, [searchParams, router])

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

  // Selecting a system template pre-fills the toggles from its saved
  // sections (the backend overlays the template's defaults with whatever
  // override this sends, so this just gives an accurate starting point);
  // Custom resets to today's local defaults instead. Reset synchronously
  // during render (React's documented pattern for "adjust state when a prop
  // changes") rather than in an effect, so the pre-filled toggles are
  // visible on the same render the template selection changes.
  const [appliedTemplateId, setAppliedTemplateId] = useState(effectiveTemplateId)
  if (appliedTemplateId !== effectiveTemplateId) {
    setAppliedTemplateId(effectiveTemplateId)
    const template = decorated.find((t) => t.id === effectiveTemplateId)
    setCustomize(template?.sections ? { ...DEFAULT_CUSTOMIZE, ...template.sections } : DEFAULT_CUSTOMIZE)
  }

  const sections: ReportSections = customize
  const toggleCustomize = (key: CustomizeKey) => setCustomize((prev) => ({ ...prev, [key]: !prev[key] }))
  const isComparisonTemplate = effectiveTemplateId === COMBINED_TEMPLATE_ID
  const toggleReportId = (id: string) =>
    setSelectedReportIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]))

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
          selectedReportIds={selectedReportIds}
          onToggleReportId={toggleReportId}
          isComparisonTemplate={isComparisonTemplate}
          selectedTemplateId={effectiveTemplateId}
          onSelectTemplate={setSelectedTemplateId}
          customize={customize}
          onToggleCustomize={toggleCustomize}
        />
        <ReportPreviewCard
          reportId={effectiveReportId}
          selectedReportIds={selectedReportIds}
          isComparisonTemplate={isComparisonTemplate}
          templateId={effectiveTemplateId}
          templateName={effectiveTemplateName}
          isResolvingReportId={isResolvingReportId}
          sections={sections}
        />
      </div>
    </div>
  )
}

export default function ReportsWorkspace() {
  return (
    <Suspense fallback={null}>
      <ReportsWorkspaceInner />
    </Suspense>
  )
}
