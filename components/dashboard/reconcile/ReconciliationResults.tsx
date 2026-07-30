'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowRight, ArrowUp, Check, Loader2, X } from 'lucide-react'
import ResultsOverviewPanel from '@/components/dashboard/reconcile/ResultsOverviewPanel'
import ResultsSidePanel from '@/components/dashboard/reconcile/ResultsSidePanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useReport, useUpdateReportName } from '@/lib/hooks/useReports'
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from '@/lib/format'
import type { ReportDetail } from '@/types/reports'
import type { GoToExplorerOptions } from './TransactionExplorerBoard'

type IconKind = 'trend' | 'check' | 'warning' | 'dollar' | 'copy'

const iconSrc: Record<IconKind, string> = {
  trend: '/icons/match-rate.png',
  check: '/icons/matched.png',
  warning: '/icons/unmatched.png',
  dollar: '/icons/break-value.png',
  copy: '/icons/duplicates.png',
}

type Stat = {
  label: string
  value: string
  sub?: string
  change?: { direction: 'up' | 'down'; value: string; isGood: boolean }
  accent: string
  icon: IconKind
  progress?: number
  highlighted?: boolean
}

function buildStats(report: ReportDetail): Stat[] {
  const matchRate = report.totalRows > 0 ? (report.matchedCount / report.totalRows) * 100 : 0
  const totalBreakValue = Number(report.totalBreakValue)
  const priorMatchRate = report.priorRun?.matchRate
  const priorBreakValue = report.priorRun?.totalBreakValue

  return [
    {
      label: 'Match Rate',
      value: formatPercent(matchRate, 2),
      change:
        priorMatchRate != null
          ? {
              direction: matchRate >= priorMatchRate ? 'up' : 'down',
              value: formatPercent(Math.abs(matchRate - priorMatchRate), 2),
              isGood: matchRate >= priorMatchRate,
            }
          : undefined,
      accent: '#2dd4bf',
      icon: 'trend',
      progress: matchRate,
      highlighted: true,
    },
    {
      label: 'Matched Transactions',
      value: formatNumber(report.matchedCount),
      sub: report.valueBreakdown ? formatCurrency(report.valueBreakdown.matchedValue) : undefined,
      accent: '#34d399',
      icon: 'check',
    },
    {
      label: 'Unmatched Transactions',
      value: formatNumber(report.unmatchedCount + report.mismatchedCount),
      sub: report.valueBreakdown ? formatCurrency(report.valueBreakdown.unmatchedValue) : undefined,
      accent: '#fb923c',
      icon: 'warning',
    },
    {
      label: 'Break Value',
      value: formatCurrency(totalBreakValue),
      // Lower break value is good — same "lower is better" convention as
      // StatsOverview/HistoryStats, not a raw up=green/down=red mapping.
      change:
        priorBreakValue != null
          ? {
              direction: totalBreakValue >= priorBreakValue ? 'up' : 'down',
              value: formatPercent(priorBreakValue > 0 ? (Math.abs(totalBreakValue - priorBreakValue) / priorBreakValue) * 100 : 0, 2),
              isGood: totalBreakValue <= priorBreakValue,
            }
          : undefined,
      accent: '#f87171',
      icon: 'dollar',
    },
    {
      label: 'Duplicates Found',
      value: formatNumber(report.duplicateCount),
      sub: report.valueBreakdown ? formatCurrency(report.valueBreakdown.duplicateValue) : undefined,
      accent: '#a78bfa',
      icon: 'copy',
    },
  ]
}

function CheckBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.5 2.5L16 9" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4.5l3 3L8 17l-4 1 1-4L14.5 4.5z" />
    </svg>
  )
}

function StatIcon({ kind, highlighted }: { kind: IconKind; highlighted?: boolean }) {
  const size = highlighted ? 96 : 64

  return (
    <div className={`relative shrink-0 ${highlighted ? 'h-24 w-24' : 'h-16 w-16'}`}>
      <Image
        src={iconSrc[kind]}
        alt=""
        width={size}
        height={size}
        className={`h-full w-full object-contain ${highlighted ? 'scale-[1.35]' : 'scale-[1.6]'}`}
      />
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-15 w-15 shrink-0 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-9 w-48 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

type ReconciliationResultsProps = {
  reportId: string
  onGoToExplorer?: (opts?: GoToExplorerOptions) => void
}

export default function ReconciliationResults({ reportId, onGoToExplorer }: ReconciliationResultsProps) {
  const { data: report, isLoading } = useReport(reportId)
  const updateName = useUpdateReportName()
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  if (isLoading || !report) return <ResultsSkeleton />

  const stats = buildStats(report)

  const startEditingName = () => {
    setNameDraft(report.name ?? '')
    setIsEditingName(true)
  }

  const commitName = () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === report.name) {
      setIsEditingName(false)
      return
    }
    updateName.mutate({ id: reportId, name: trimmed }, { onSuccess: () => setIsEditingName(false) })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-15 w-15 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckBadge />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Reconciliation Results</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Your reconciliation is complete. Here&apos;s how your data matched.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => onGoToExplorer?.()}
            className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
          >
            Go to Transaction Explorer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">Reconciliation Name:</span>
          {isEditingName ? (
            <>
              <input
                type="text"
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName()
                  if (e.key === 'Escape') setIsEditingName(false)
                }}
                maxLength={255}
                className="w-48 rounded-md border border-[#232D47] bg-[#0A1128] px-2 py-0.5 font-medium text-slate-200 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
              />
              <button
                type="button"
                aria-label="Save name"
                onClick={commitName}
                disabled={updateName.isPending}
                className="cursor-pointer text-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateName.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => setIsEditingName(false)}
                disabled={updateName.isPending}
                className="cursor-pointer text-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-200">{report.name ?? 'Untitled Reconciliation'}</span>
              <button
                type="button"
                aria-label="Rename reconciliation"
                onClick={startEditingName}
                className="cursor-pointer text-slate-500 hover:text-white"
              >
                <PencilIcon />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">Date:</span>
          <span className="font-medium text-slate-200">{formatDateTime(report.runDate)}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">File Pair:</span>
          <span className="font-medium text-slate-200">{report.fileAName ?? '—'}</span>
          <span className="rounded border border-[#232D47] px-1 py-0.5 text-[10px] font-semibold text-slate-400">VS</span>
          <span className="font-medium text-slate-200">{report.fileBName ?? '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-3"
            style={
              stat.highlighted
                ? {
                    background: `radial-gradient(140% 120% at 0% 0%, ${stat.accent}26, transparent 65%), #0E182D`,
                    borderColor: `${stat.accent}50`,
                  }
                : { borderColor: '#232D47' }
            }
          >
            {stat.highlighted ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <TruncateTooltip as="p" className="truncate text-sm font-medium text-slate-300" tooltip={stat.label}>
                    {stat.label}
                  </TruncateTooltip>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>

                  {typeof stat.progress === 'number' && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-[#1B2540]">
                      <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${stat.progress}%` }} />
                    </div>
                  )}

                  {stat.change && (
                    <p className="mt-3 flex items-center gap-1 text-xs font-medium">
                      <span className={`flex items-center gap-0.5 ${stat.change.isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                        {stat.change.direction === 'up' ? (
                          <ArrowUp className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          <ArrowDown className="h-3 w-3" strokeWidth={3} />
                        )}
                        {stat.change.value}
                      </span>
                      <TruncateTooltip as="span" className="truncate text-slate-400" tooltip="vs last run">
                        vs last run
                      </TruncateTooltip>
                    </p>
                  )}
                </div>

                <StatIcon kind={stat.icon} highlighted={stat.highlighted} />
              </div>
            ) : (
              <>
                <TruncateTooltip as="p" className="truncate text-sm font-medium text-slate-300" tooltip={stat.label}>
                  {stat.label}
                </TruncateTooltip>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>

                    <div className="my-2 border-t border-[#1B2540]" />

                    {stat.sub && <p className="text-xs text-slate-400">{stat.sub}</p>}

                    {stat.change && (
                      <p className="flex items-center gap-1 text-xs font-medium">
                        <span className={`flex items-center gap-0.5 ${stat.change.isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stat.change.direction === 'up' ? (
                            <ArrowUp className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            <ArrowDown className="h-3 w-3" strokeWidth={3} />
                          )}
                          {stat.change.value}
                        </span>
                        <TruncateTooltip as="span" className="truncate text-slate-400" tooltip="vs last run">
                          vs last run
                        </TruncateTooltip>
                      </p>
                    )}
                  </div>

                  <StatIcon kind={stat.icon} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ResultsOverviewPanel reportId={reportId} report={report} onGoToExplorer={onGoToExplorer} />
        <ResultsSidePanel reportId={reportId} report={report} onGoToExplorer={onGoToExplorer} />
      </div>
    </div>
  )
}
