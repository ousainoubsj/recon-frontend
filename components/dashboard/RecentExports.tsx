'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu } from '@base-ui/react/menu'
import { Check, ChevronLeft, ChevronRight, Download, FileText, Loader2, MoreVertical, Search, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { formatDateTime, formatFileSize } from '@/lib/format'
import { useDeleteExport, useDownloadExport, useExports } from '@/lib/hooks/useReports'
import type { BulkExportFormat, ReportExport } from '@/types/reports'

type Format = 'PDF' | 'Excel'
type Status = 'Completed' | 'Failed'

const FORMAT_LABEL: Record<BulkExportFormat, Format> = { pdf: 'PDF', xlsx: 'Excel' }
const STATUS_LABEL: Record<ReportExport['status'], Status> = { success: 'Completed', failed: 'Failed' }

const formatStyles: Record<Format, string> = {
  PDF: 'bg-rose-500/15 text-rose-400',
  Excel: 'bg-emerald-500/15 text-emerald-400',
}

const iconStyles: Record<Format, string> = {
  PDF: 'text-rose-400',
  Excel: 'text-emerald-400',
}

const statusStyles: Record<Status, string> = {
  Completed: 'text-emerald-400',
  Failed: 'text-rose-400',
}

const FETCH_CAP = 200
const PAGE_SIZE = 8

// Same visual language as HistoryTable.tsx's EmptyHistory (row-mockup SVG +
// title/subtitle) — no shared component exists to import, each table
// defines its own local copy by convention in this codebase.
function EmptyExports({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyExportsGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="70" height="60" rx="8" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="4" fill="#2C3654" />
        <rect x="34" y="19.5" width="40" height="3" rx="1.5" fill="#3A4568" />
        <rect x="34" y="26" width="26" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="38" r="4" fill="#1CEAEA" fillOpacity="0.5" />
        <rect x="34" y="35.5" width="34" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="42" width="22" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="54" r="4" fill="#2C3654" />
        <rect x="34" y="51.5" width="40" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="58" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="80" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        {hasSearch ? (
          <>
            <circle cx="80" cy="66" r="8" stroke="url(#emptyExportsGlow)" strokeWidth="2" fill="none" />
            <path d="M80 61v5l3.5 2.5" stroke="url(#emptyExportsGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : (
          <path d="M80 60v12M74 66h12" stroke="url(#emptyExportsGlow)" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
      {hasSearch ? (
        <div>
          <p className="text-sm font-medium text-slate-200">No exports match your search</p>
          <p className="mt-1 text-xs text-slate-400">Try a different report name or reconciliation.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-slate-200">No exports yet</p>
          <p className="mt-1 text-xs text-slate-400">Generate a report to see it here.</p>
        </div>
      )}
    </div>
  )
}

function RunByAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return <Image src={image} alt={name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500 text-[11px] font-semibold text-white">
      {initials || '—'}
    </span>
  )
}

export default function RecentExports() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const downloadExport = useDownloadExport()
  const deleteExport = useDeleteExport()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 450)
    return () => clearTimeout(timer)
  }, [search])

  const { data: exports, isLoading } = useExports({ limit: FETCH_CAP, q: debouncedSearch || undefined })
  const rows = exports ?? []

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const visibleRows = rows.slice(startIndex, startIndex + PAGE_SIZE)
  const pageItems: (number | '...')[] =
    totalPages <= 5 ? Array.from({ length: totalPages }, (_, index) => index + 1) : [1, 2, 3, '...', totalPages]

  const handleDownload = (row: ReportExport) => {
    downloadExport.mutate(row.id)
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return
    deleteExport.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white">Recent Exports</h3>
        <p className="mt-1 text-sm text-slate-400">Your recently generated and downloaded reports.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by report name or reconciliation..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4">
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4 text-nowrap font-semibold">Report Name</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reconciliation</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Generated By</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Date &amp; Time</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Format</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Size</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [0, 1, 2].map((i) => (
                  <tr key={i} className="border-t border-[#1B2540]">
                    <td className="py-3 pr-4" colSpan={8}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyExports hasSearch={!!debouncedSearch} />
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const format = FORMAT_LABEL[row.format]
                  const status = STATUS_LABEL[row.status]
                  const reconciliationName = row.report.name ?? `${row.report.fileAName ?? '—'} vs ${row.report.fileBName ?? '—'}`

                  return (
                    <tr key={row.id} className="border-t border-[#1B2540]">
                      <td className="max-w-56 py-3 pr-4 align-top">
                        <div className="flex items-center gap-2">
                          <FileText className={`h-5 w-5 shrink-0 ${iconStyles[format]}`} />
                          <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={reconciliationName}>
                            {reconciliationName}
                          </TruncateTooltip>
                        </div>
                      </td>
                      <td className="max-w-40 py-3 pr-4 align-top">
                        <TruncateTooltip as="p" className="truncate text-slate-300" tooltip={reconciliationName}>
                          {reconciliationName}
                        </TruncateTooltip>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <div className="flex items-center gap-2">
                          <RunByAvatar name={row.user.name} image={row.user.image} />
                          <span className="text-nowrap text-slate-200">{row.user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top text-nowrap">
                        <p className="text-slate-200">{formatDateTime(row.createdAt)}</p>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${formatStyles[format]}`}>
                          {format}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top text-nowrap text-slate-300">{formatFileSize(row.fileSizeBytes) || '—'}</td>
                      <td className="py-3 pr-4 align-top">
                        <span className={`flex items-center gap-1 text-nowrap font-medium ${statusStyles[status]}`}>
                          {status}
                          {status === 'Completed' && <Check className="h-3.5 w-3.5" />}
                          {status === 'Failed' && <XCircle className="h-3.5 w-3.5" />}
                        </span>
                      </td>
                      <td className="py-3 align-top">
                        <div className="flex items-center gap-3 text-slate-400">
                          <button
                            type="button"
                            aria-label="Download"
                            disabled={status !== 'Completed' || downloadExport.isPending}
                            onClick={() => handleDownload(row)}
                            className="cursor-pointer hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-400"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <Menu.Root>
                            <Menu.Trigger
                              aria-label="More actions"
                              className="cursor-pointer outline-none hover:text-white"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Menu.Trigger>
                            <Menu.Portal>
                              <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50">
                                <Menu.Popup className="min-w-40 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none">
                                  <Menu.Item
                                    onClick={() => router.push(`/dashboard/reconciliation-process/${row.reportId}`)}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-200 outline-none data-highlighted:bg-white/5 data-highlighted:text-white"
                                  >
                                    View Reconciliation
                                  </Menu.Item>
                                  <Menu.Item
                                    onClick={() => setPendingDeleteId(row.id)}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-rose-400 outline-none data-highlighted:bg-rose-500/10"
                                  >
                                    Delete
                                  </Menu.Item>
                                </Menu.Popup>
                              </Menu.Positioner>
                            </Menu.Portal>
                          </Menu.Root>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {rows.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, rows.length)} of {rows.length} exports
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageItems.map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-slate-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                    safePage === page ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300">{PAGE_SIZE} / page</span>
        </div>
      </div>

      <Dialog
        open={pendingDeleteId != null}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteId(null)
        }}
      >
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-rose-400">Delete export?</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              This permanently deletes the generated file and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteId(null)}
              className="cursor-pointer border-[#232D47] bg-transparent p-3.5 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteExport.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-rose-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteExport.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteExport.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
