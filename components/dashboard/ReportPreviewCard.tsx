'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, CheckCircle2, CircleSlash, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import * as XLSX from 'xlsx'
import ReportExcelPreview from '@/components/dashboard/ReportExcelPreview'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { usePreviewReport, useReport } from '@/lib/hooks/useReports'
import { CUSTOM_TEMPLATE_ID } from '@/lib/reportTemplateDecorations'

type PreviewFormat = 'pdf' | 'xlsx'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Decorative only, not tied to real data — this mini bar chart is a static
// visual flourish next to the real donut/stat tiles, same as the original
// mock's fixed values.
const trendSeries = [{ name: 'Volume', data: [40, 62, 78, 55, 70, 48, 30] }]

// Matches ChartsOverview.tsx's canonical category-breakdown palette, for
// visual consistency across the dashboard's two donut charts.
const CATEGORY_COLORS = {
  matched: '#34D399',
  mismatched: '#6366F1',
  unmatched: '#3B82F6',
  duplicates: '#F43F5E',
}

const donutOptions: ApexOptions = {
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: Object.values(CATEGORY_COLORS),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { show: false },
  plotOptions: { pie: { donut: { size: '68%' } } },
  tooltip: { enabled: false },
}

const barOptions: ApexOptions = {
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  colors: ['#6366F1'],
  dataLabels: { enabled: false },
  plotOptions: { bar: { borderRadius: 2, columnWidth: '55%' } },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.9, opacityTo: 0.4, gradientToColors: ['#38BDF8'] },
  },
  grid: { show: false },
  legend: { show: false },
  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { show: false } },
  tooltip: { enabled: false },
}

type ReportPreviewCardProps = {
  reportId: string | null
  templateId: string | null
  templateName: string | null
  // True while the parent is still resolving which reconciliation to
  // auto-select (before any real reportId exists yet) — without this, a
  // still-loading default read as "no reconciliations" and flashed the
  // empty state on every load.
  isResolvingReportId?: boolean
}

// "Custom Report" already ends in "Report" — avoid "Custom Report Report".
function reportTitle(templateName: string | null) {
  if (!templateName) return 'Report'
  return templateName.endsWith('Report') ? templateName : `${templateName} Report`
}

// Mirrors the real card's structure section-for-section (thumbnail + title
// block, matched/unmatched stat cells, bar + donut chart areas, footer
// link) rather than a couple of generic bars, per the loading-skeleton
// convention used elsewhere in this file's siblings.
function PreviewCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Report Preview</h3>
        <Skeleton className="h-4 w-32 shrink-0" />
      </div>
      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/60 px-2.5">
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 border-t border-[#232D47]">
          <div className="border-r border-b border-[#232D47] py-4 pr-4">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="mt-2 h-3 w-16" />
            <Skeleton className="mt-2 h-3 w-12" />
          </div>
          <div className="border-b border-[#232D47] py-4 pl-4">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="mt-2 h-3 w-16" />
            <Skeleton className="mt-2 h-3 w-12" />
          </div>

          <div className="flex items-end border-r border-[#232D47] py-2 pr-4">
            <Skeleton className="h-22.5 w-full" />
          </div>
          <div className="flex items-center gap-2 py-2 pl-4">
            <Skeleton className="h-22.5 w-22.5 shrink-0 rounded-full" />
            <div className="flex shrink-0 flex-col gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-1.5 w-1.5 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportPreviewCard({
  reportId,
  templateId,
  templateName,
  isResolvingReportId,
}: ReportPreviewCardProps) {
  const { data: report, isLoading } = useReport(reportId ?? undefined, { preview: true })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeFormat, setActiveFormat] = useState<PreviewFormat>('pdf')
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [excelWorkbook, setExcelWorkbook] = useState<XLSX.WorkBook | null>(null)
  // Kept alongside the parsed workbook — ReportExcelPreview needs the raw
  // bytes too, to extract embedded images (org logo, Reconcil wordmark),
  // which aren't part of SheetJS's cell/workbook model at all.
  const [excelBuffer, setExcelBuffer] = useState<ArrayBuffer | null>(null)
  // Two independent mutation instances (not one shared one) so switching
  // tabs doesn't clobber the other format's in-flight/error state — each
  // format tracks its own isPending/isError.
  const previewPdf = usePreviewReport()
  const previewExcel = usePreviewReport()

  // Revokes the previous PDF blob URL whenever a new one is set, and on
  // unmount — URL.createObjectURL'd URLs otherwise leak for the life of the
  // tab. The Excel workbook is a plain parsed object, not a blob URL, so it
  // needs no equivalent cleanup.
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    }
  }, [pdfPreviewUrl])

  const templateIdForPayload = templateId === CUSTOM_TEMPLATE_ID ? undefined : (templateId ?? undefined)

  const loadPdfPreview = () => {
    if (!reportId) return
    previewPdf.mutate(
      { id: reportId, input: { format: 'pdf', preview: true, templateId: templateIdForPayload } },
      { onSuccess: ({ blob }) => setPdfPreviewUrl(URL.createObjectURL(blob)) },
    )
  }

  const loadExcelPreview = () => {
    if (!reportId) return
    previewExcel.mutate(
      { id: reportId, input: { format: 'xlsx', preview: true, templateId: templateIdForPayload } },
      {
        onSuccess: async ({ blob }) => {
          const buffer = await blob.arrayBuffer()
          setExcelWorkbook(XLSX.read(buffer, { type: 'array', cellStyles: true }))
          setExcelBuffer(buffer)
        },
      },
    )
  }

  const handlePreviewClick = () => {
    if (!reportId) return
    setPreviewOpen(true)
    setActiveFormat('pdf')
    // Stale the moment a new preview starts — drops any previous
    // template's/report's output so a slow request can't leave it showing.
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
    setPdfPreviewUrl(null)
    setExcelWorkbook(null)
    setExcelBuffer(null)
    loadPdfPreview()
  }

  const handleTabChange = (format: PreviewFormat) => {
    setActiveFormat(format)
    if (format === 'xlsx' && !excelWorkbook && !previewExcel.isPending) loadExcelPreview()
  }

  if (isResolvingReportId) {
    return <PreviewCardSkeleton />
  }

  if (!reportId) {
    return (
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Report Preview</h3>
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-[#232D47] bg-[#0E182D]/60 px-4 text-center">
          <p className="text-sm text-slate-400">No completed reconciliations to preview yet.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !report) {
    return <PreviewCardSkeleton />
  }

  const matched = report.matchedCount
  const unmatched = report.unmatchedCount + report.mismatchedCount
  const matchedPercent = report.totalRows > 0 ? (matched / report.totalRows) * 100 : 0
  const unmatchedPercent = report.totalRows > 0 ? (unmatched / report.totalRows) * 100 : 0

  const matchSegments = [
    { value: report.matchedCount, color: CATEGORY_COLORS.matched },
    { value: report.mismatchedCount, color: CATEGORY_COLORS.mismatched },
    { value: report.unmatchedCount, color: CATEGORY_COLORS.unmatched },
    { value: report.duplicateCount, color: CATEGORY_COLORS.duplicates },
  ]

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Report Preview</h3>
        <button
          type="button"
          onClick={handlePreviewClick}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-sm font-medium text-indigo-400 transition-all duration-300 hover:underline active:scale-95"
        >
          Preview Full Report
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/60 px-2.5">
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 flex-col overflow-hidden rounded-sm bg-slate-300">
            <span className="flex flex-1 items-center justify-center">
              <FileText className="h-5 w-5 text-slate-500" />
            </span>
            <span className="h-1 w-full bg-linear-to-r from-indigo-500 to-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{reportTitle(templateName)}</p>
            <p className="mt-0.5 truncate text-sm text-slate-400">{report.name ?? 'Untitled Reconciliation'}</p>
            <p className="text-xs text-slate-500">{formatDate(report.runDate)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 border-t border-[#232D47]">
          <div className="border-r border-b border-[#232D47] py-4 pr-4">
            <p className="text-2xl font-bold text-white">{matched.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Matched</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {matchedPercent.toFixed(2)}%
            </p>
          </div>
          <div className="border-b border-[#232D47] py-4 pl-4">
            <p className="text-2xl font-bold text-white">{unmatched.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Unmatched</p>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-rose-400">
              <CircleSlash className="h-3.5 w-3.5" />
              {unmatchedPercent.toFixed(2)}%
            </p>
          </div>

          <div className="border-r border-[#232D47] py-2 pr-4">
            <div className="-mt-8">
            <Chart options={barOptions} series={trendSeries} type="bar" height={120} />
            </div>
          </div>
          <div className="flex items-center gap-2 py-2 pl-4">
            <div className="min-w-0 flex-1">
              <Chart options={donutOptions} series={matchSegments.map((s) => s.value)} type="donut" height={90} />
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              {matchSegments.map((seg, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[85vh] w-full max-w-4xl flex-col gap-3 border border-[#232D47] bg-[#0E182D] p-3 text-white sm:max-w-4xl">
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => handleTabChange('pdf')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95 ${
                activeFormat === 'pdf' ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-[#232D47] text-slate-400 hover:bg-white/5'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('xlsx')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95 ${
                activeFormat === 'xlsx'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#232D47] text-slate-400 hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Excel
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-[#232D47] bg-[#0A1128]">
            {activeFormat === 'pdf' ? (
              previewPdf.isError ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm text-slate-400">Couldn&apos;t generate the preview. Please try again.</p>
                </div>
              ) : pdfPreviewUrl ? (
                <iframe src={pdfPreviewUrl} title="Report PDF preview" className="h-full w-full" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  <p className="text-sm text-slate-400">Generating preview…</p>
                </div>
              )
            ) : previewExcel.isError ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <p className="text-sm text-slate-400">Couldn&apos;t generate the preview. Please try again.</p>
              </div>
            ) : excelWorkbook && excelBuffer ? (
              <ReportExcelPreview workbook={excelWorkbook} buffer={excelBuffer} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <p className="text-sm text-slate-400">Generating preview…</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
