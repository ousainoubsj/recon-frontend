'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'
import { Menu } from '@base-ui/react/menu'
import { Check, ChevronDown, FileChartColumn, FileSpreadsheet, FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import EmailReportDialog from '@/components/dashboard/EmailReportDialog'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { useExportComparisonReport, useExportReport, useReports } from '@/lib/hooks/useReports'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'
import { CUSTOM_TEMPLATE_ID, decorateTemplates, type CustomizeKey } from '@/lib/reportTemplateDecorations'
import type { ReportSections } from '@/types/reports'
import SupersededBadge from '@/components/dashboard/SupersededBadge'

type FormatKey = 'pdf' | 'excel'
const FORMAT_TO_API: Record<FormatKey, 'pdf' | 'xlsx'> = { pdf: 'pdf', excel: 'xlsx' }

const formatOptions: {
  key: FormatKey
  label: string
  Icon: typeof FileText
  iconClassName: string
  selectedClassName: string
}[] = [
  {
    key: 'pdf',
    label: 'PDF',
    Icon: FileText,
    iconClassName: 'text-danger',
    selectedClassName: 'border-danger-solid/50 bg-danger-solid/10 text-danger',
  },
  {
    key: 'excel',
    label: 'Excel',
    Icon: FileSpreadsheet,
    iconClassName: 'text-success',
    selectedClassName: 'border-success-solid bg-success-solid/10 text-success',
  },
]

const customizeOptions: { key: CustomizeKey; label: string }[] = [
  { key: 'summary', label: 'Include Summary' },
  { key: 'matchStatistics', label: 'Include Match Statistics' },
  { key: 'breakAnalysis', label: 'Include Break Analysis' },
  { key: 'unmatchedDetails', label: 'Include Unmatched Details' },
  { key: 'chartsAndGraphs', label: 'Include Charts & Graphs' },
]

type ReportBuilderProps = {
  selectedReportId: string | null
  onSelectReport: (id: string) => void
  // Only meaningful when isComparisonTemplate — see ReportsWorkspace.tsx for
  // why this is a separate array rather than overloading selectedReportId.
  selectedReportIds: string[]
  onToggleReportId: (id: string) => void
  isComparisonTemplate: boolean
  selectedTemplateId: string
  onSelectTemplate: (id: string) => void
  // Lifted up to ReportsWorkspace, alongside selectedTemplateId — the sibling
  // ReportPreviewCard needs the same sections so "Preview Full Report" under
  // Custom reflects what's actually toggled here.
  customize: Record<CustomizeKey, boolean>
  onToggleCustomize: (key: CustomizeKey) => void
}

export default function ReportBuilder({
  selectedReportId,
  onSelectReport,
  selectedReportIds,
  onToggleReportId,
  isComparisonTemplate,
  selectedTemplateId,
  onSelectTemplate,
  customize,
  onToggleCustomize,
}: ReportBuilderProps) {
  const { formatDateTime } = useOrgFormat()
  const [format, setFormat] = useState<FormatKey>('pdf')
  const [emailOpen, setEmailOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data: reports, isLoading: reportsLoading } = useReports({ status: 'completed', limit: 50 })
  const { data: templates } = useReportTemplates()
  const decorated = decorateTemplates(templates)
  const selectedTemplate = decorated.find((t) => t.id === selectedTemplateId)
  const selectedReport = reports?.find((r) => r.id === selectedReportId)
  const exportReport = useExportReport()
  const exportComparisonReport = useExportComparisonReport()

  const isCustomTemplate = selectedTemplateId === CUSTOM_TEMPLATE_ID
  // Both pseudo-templates (Custom, Combined) have no saved sections of their
  // own — customization is always freely editable for either.
  const sectionsEditable = isCustomTemplate || isComparisonTemplate

  const toggleCustomize = (key: CustomizeKey) => {
    if (!sectionsEditable) return
    onToggleCustomize(key)
  }

  const sections: ReportSections = customize
  const templateIdForPayload = selectedTemplateId === CUSTOM_TEMPLATE_ID ? undefined : selectedTemplateId

  const handleGenerate = () => {
    if (isComparisonTemplate) {
      if (selectedReportIds.length < 2) return
      exportComparisonReport.mutate(
        { ids: selectedReportIds, format: FORMAT_TO_API[format], sections },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'exports'] }) },
      )
      return
    }
    if (!selectedReportId) return
    exportReport.mutate(
      { id: selectedReportId, input: { format: FORMAT_TO_API[format], templateId: templateIdForPayload, sections } },
      // Unlike RecentExports' row-level re-download, this genuinely creates
      // a new export, so (and only so) this call site refreshes the list.
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'exports'] }) },
    )
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-inset/70 p-4">
      <h3 className="text-base font-semibold text-foreground">Create New Report</h3>

      <div className="mt-2 space-y-2">
        <p className="text-sm text-fg-muted">1. Select Reconciliation{isComparisonTemplate ? 's' : ''}</p>
        <Menu.Root>
          <Menu.Trigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-left outline-none hover:bg-overlay/5">
            {isComparisonTemplate ? (
              <span className="text-sm text-fg-strong">
                {selectedReportIds.length === 0
                  ? 'Select 2+ completed reconciliations'
                  : `${selectedReportIds.length} reconciliation${selectedReportIds.length === 1 ? '' : 's'} selected`}
              </span>
            ) : selectedReport ? (
              <span>
                <span className="block font-medium text-foreground">{selectedReport.name ?? 'Untitled Reconciliation'}</span>
                <span className="mt-0.5 block text-xs text-fg-muted">{formatDateTime(selectedReport.runDate)}</span>
                {selectedReport.supersededBy && <SupersededBadge supersededBy={selectedReport.supersededBy} />}
              </span>
            ) : (
              <span className="text-sm text-fg-muted">{reportsLoading ? 'Loading…' : 'Select a completed reconciliation'}</span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50 w-(--anchor-width)">
              <Menu.Popup className="max-h-64 min-w-64 overflow-y-auto rounded-lg border border-line bg-surface shadow-lg shadow-black/40 outline-none">
                {!reports || reports.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-fg-subtle">No completed reconciliations yet.</p>
                ) : isComparisonTemplate ? (
                  reports.map((report) => (
                    <Menu.CheckboxItem
                      key={report.id}
                      checked={selectedReportIds.includes(report.id)}
                      onCheckedChange={() => onToggleReportId(report.id)}
                      closeOnClick={false}
                      className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left outline-none data-highlighted:bg-overlay/5"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                          selectedReportIds.includes(report.id) ? 'border-success-solid bg-success-solid' : 'border-line bg-transparent'
                        }`}
                      >
                        {selectedReportIds.includes(report.id) && <Check className="h-3 w-3 text-brand-foreground" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-fg-strong">{report.name ?? 'Untitled Reconciliation'}</span>
                        <span className="text-xs text-fg-subtle">{formatDateTime(report.runDate)}</span>
                        {report.supersededBy && <SupersededBadge supersededBy={report.supersededBy} />}
                      </span>
                    </Menu.CheckboxItem>
                  ))
                ) : (
                  reports.map((report) => (
                    <Menu.Item
                      key={report.id}
                      onClick={() => onSelectReport(report.id)}
                      className="flex cursor-pointer flex-col items-start rounded-md px-3 py-2 text-left outline-none data-highlighted:bg-overlay/5"
                    >
                      <span className="truncate text-sm text-fg-strong">{report.name ?? 'Untitled Reconciliation'}</span>
                      <span className="text-xs text-fg-subtle">{formatDateTime(report.runDate)}</span>
                      {report.supersededBy && <SupersededBadge supersededBy={report.supersededBy} />}
                    </Menu.Item>
                  ))
                )}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-sm text-fg-muted">2. Select Template</p>
        <Menu.Root>
          <Menu.Trigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-foreground outline-none hover:bg-overlay/5">
            {selectedTemplate?.name ?? 'Select a template'}
            <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50 w-(--anchor-width)">
              <Menu.Popup className="min-w-64 rounded-lg border border-line bg-surface shadow-lg shadow-black/40 outline-none">
                {decorated.map((template) => (
                  <Menu.Item
                    key={template.id}
                    onClick={() => onSelectTemplate(template.id)}
                    className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg-strong outline-none data-highlighted:bg-overlay/5"
                  >
                    {template.name}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg-muted">3. Customize Report</p>
          {!sectionsEditable && <p className="text-xs text-fg-subtle">Select Custom or Combined Report to edit</p>}
        </div>
        <div className="mt-3 space-y-3">
          {customizeOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCustomize(key)}
              disabled={!sectionsEditable}
              className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed cursor-pointer"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                  customize[key] ? 'border-success-solid bg-success-solid' : 'border-line bg-transparent'
                } ${!sectionsEditable ? 'opacity-50' : ''}`}
              >
                {customize[key] && <Check className="h-3.5 w-3.5 text-brand-foreground" />}
              </span>
              <span className={`text-sm text-fg-secondary ${!sectionsEditable ? 'opacity-50' : ''}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-sm text-fg-muted">4. Choose Format</p>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map(({ key, label, Icon, iconClassName, selectedClassName }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                format === key ? selectedClassName : 'border-line text-fg-secondary hover:bg-overlay/5'
              }`}
            >
              <Icon className={`h-4 w-4 ${format === key ? '' : iconClassName}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={
          isComparisonTemplate
            ? selectedReportIds.length < 2 || exportComparisonReport.isPending
            : !selectedReportId || exportReport.isPending
        }
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        {(isComparisonTemplate ? exportComparisonReport.isPending : exportReport.isPending) ? (
          <Skeleton className="h-4 w-24 bg-overlay/20" />
        ) : (
          <>
            <FileChartColumn className="h-4 w-4" />
            Generate Report
          </>
        )}
      </button>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          disabled={isComparisonTemplate ? selectedReportIds.length < 2 : !selectedReportId}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-line py-3 text-sm font-medium text-fg-strong transition-all duration-300 active:scale-95 hover:bg-overlay/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <Image src="/icons/gmail-icon.png" alt="" width={20} height={20} className="h-4 w-4 shrink-0" />
          Email Report
        </button>
      </div>

      {isComparisonTemplate
        ? selectedReportIds.length >= 2 && (
            <EmailReportDialog open={emailOpen} onOpenChange={setEmailOpen} reportIds={selectedReportIds} />
          )
        : selectedReportId && <EmailReportDialog open={emailOpen} onOpenChange={setEmailOpen} reportId={selectedReportId} />}
    </div>
  )
}
