'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Menu } from '@base-ui/react/menu'
import { CalendarClock, Check, ChevronDown, FileChartColumn, FileSpreadsheet, FileText, Mail } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import EmailReportDialog from '@/components/dashboard/EmailReportDialog'
import ScheduleReportDialog from '@/components/dashboard/ScheduleReportDialog'
import { formatDateTime } from '@/lib/format'
import { useExportReport, useReports } from '@/lib/hooks/useReports'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'
import { CUSTOM_TEMPLATE_ID, decorateTemplates, type CustomizeKey } from '@/lib/reportTemplateDecorations'
import type { ReportSections } from '@/types/reports'

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
    iconClassName: 'text-rose-400',
    selectedClassName: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
  },
  {
    key: 'excel',
    label: 'Excel',
    Icon: FileSpreadsheet,
    iconClassName: 'text-emerald-400',
    selectedClassName: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
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
  selectedTemplateId,
  onSelectTemplate,
  customize,
  onToggleCustomize,
}: ReportBuilderProps) {
  const [format, setFormat] = useState<FormatKey>('pdf')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data: reports, isLoading: reportsLoading } = useReports({ status: 'completed', limit: 50 })
  const { data: templates } = useReportTemplates()
  const decorated = decorateTemplates(templates)
  const selectedTemplate = decorated.find((t) => t.id === selectedTemplateId)
  const selectedReport = reports?.find((r) => r.id === selectedReportId)
  const exportReport = useExportReport()

  const isCustomTemplate = selectedTemplateId === CUSTOM_TEMPLATE_ID

  const toggleCustomize = (key: CustomizeKey) => {
    if (!isCustomTemplate) return
    onToggleCustomize(key)
  }

  const sections: ReportSections = customize
  const templateIdForPayload = selectedTemplateId === CUSTOM_TEMPLATE_ID ? undefined : selectedTemplateId

  const handleGenerate = () => {
    if (!selectedReportId) return
    exportReport.mutate(
      { id: selectedReportId, input: { format: FORMAT_TO_API[format], templateId: templateIdForPayload, sections } },
      // Unlike RecentExports' row-level re-download, this genuinely creates
      // a new export, so (and only so) this call site refreshes the list.
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'exports'] }) },
    )
  }

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
      <h3 className="text-base font-semibold text-white">Create New Report</h3>

      <div className="mt-2 space-y-2">
        <p className="text-sm text-slate-400">1. Select Reconciliation</p>
        <Menu.Root>
          <Menu.Trigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#232D47] bg-[#0A1128] px-4 py-3 text-left outline-none hover:bg-white/5">
            {selectedReport ? (
              <span>
                <span className="block font-medium text-white">{selectedReport.name ?? 'Untitled Reconciliation'}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{formatDateTime(selectedReport.runDate)}</span>
              </span>
            ) : (
              <span className="text-sm text-slate-400">{reportsLoading ? 'Loading…' : 'Select a completed reconciliation'}</span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50 w-(--anchor-width)">
              <Menu.Popup className="max-h-64 min-w-64 overflow-y-auto rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none">
                {!reports || reports.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-500">No completed reconciliations yet.</p>
                ) : (
                  reports.map((report) => (
                    <Menu.Item
                      key={report.id}
                      onClick={() => onSelectReport(report.id)}
                      className="flex cursor-pointer flex-col items-start rounded-md px-3 py-2 text-left outline-none data-highlighted:bg-white/5"
                    >
                      <span className="truncate text-sm text-slate-200">{report.name ?? 'Untitled Reconciliation'}</span>
                      <span className="text-xs text-slate-500">{formatDateTime(report.runDate)}</span>
                    </Menu.Item>
                  ))
                )}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-sm text-slate-400">2. Select Template</p>
        <Menu.Root>
          <Menu.Trigger className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-[#232D47] bg-[#0A1128] px-4 py-3 text-sm font-medium text-white outline-none hover:bg-white/5">
            {selectedTemplate?.name ?? 'Select a template'}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="start" sideOffset={8} className="z-50 w-(--anchor-width)">
              <Menu.Popup className="min-w-64 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none">
                {decorated.map((template) => (
                  <Menu.Item
                    key={template.id}
                    onClick={() => onSelectTemplate(template.id)}
                    className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-slate-200 outline-none data-highlighted:bg-white/5"
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
          <p className="text-sm text-slate-400">3. Customize Report</p>
          {!isCustomTemplate && <p className="text-xs text-slate-500">Select Custom Report to edit</p>}
        </div>
        <div className="mt-3 space-y-3">
          {customizeOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleCustomize(key)}
              disabled={!isCustomTemplate}
              className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed cursor-pointer"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                  customize[key] ? 'border-emerald-500 bg-emerald-500' : 'border-[#232D47] bg-transparent'
                } ${!isCustomTemplate ? 'opacity-50' : ''}`}
              >
                {customize[key] && <Check className="h-3.5 w-3.5 text-[#050F20]" />}
              </span>
              <span className={`text-sm text-slate-300 ${!isCustomTemplate ? 'opacity-50' : ''}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-sm text-slate-400">4. Choose Format</p>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map(({ key, label, Icon, iconClassName, selectedClassName }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                format === key ? selectedClassName : 'border-[#232D47] text-slate-300 hover:bg-white/5'
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
        disabled={!selectedReportId || exportReport.isPending}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
      >
        {exportReport.isPending ? (
          <Skeleton className="h-4 w-24 bg-white/20" />
        ) : (
          <>
            <FileChartColumn className="h-4 w-4" />
            Generate Report
          </>
        )}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setScheduleOpen(true)}
          disabled={!selectedReportId}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#232D47] py-3 text-sm font-medium text-slate-200 transition-all duration-300 active:scale-95 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <CalendarClock className="h-4 w-4" />
          Schedule
        </button>

        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          disabled={!selectedReportId}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#232D47] py-3 text-sm font-medium text-slate-200 transition-all duration-300 active:scale-95 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>

      {selectedReportId && (
        <>
          <ScheduleReportDialog
            open={scheduleOpen}
            onOpenChange={setScheduleOpen}
            reportId={selectedReportId}
            format={FORMAT_TO_API[format]}
            templateId={templateIdForPayload}
            sections={sections}
          />
          <EmailReportDialog open={emailOpen} onOpenChange={setEmailOpen} reportId={selectedReportId} />
        </>
      )}
    </div>
  )
}
