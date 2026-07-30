'use client'

import { useState } from 'react'
import { CheckCircle2, CircleDot, Loader2, Printer, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarkRowReviewed, useTransaction } from '@/lib/hooks/useReports'
import { formatCurrency } from '@/lib/format'
import type { TransactionRowStatus } from '@/types/reports'

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'ledger', label: 'Ledger Details' },
  { key: 'counterparty', label: 'Counterparty Details' },
] as const

type TabKey = (typeof tabs)[number]['key']

const STATUS_BADGE: Record<TransactionRowStatus, string> = {
  Matched: 'bg-emerald-950/60 text-emerald-400',
  Mismatched: 'bg-red-950/60 text-red-400',
  Unmatched: 'bg-amber-950/60 text-amber-400',
  Duplicate: 'bg-violet-950/60 text-violet-400',
}

function DetailSkeleton() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/50 p-5">
      <div className="flex items-center justify-between pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div className="border-t border-[#232D47] py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
      <div className="grid grid-cols-3 gap-3 border-t border-b border-[#232D47] py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

type TransactionExplorerSidebarProps = {
  reportId: string
  rowId?: string
  onClose: () => void
}

export default function TransactionExplorerSidebar({ reportId, rowId, onClose }: TransactionExplorerSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const { data: detail, isLoading } = useTransaction(reportId, rowId)
  const markReviewed = useMarkRowReviewed()

  if (!rowId) {
    return (
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/50 p-5">
        <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
        <p className="mt-4 text-sm text-slate-400">Select a transaction from the table to see its details.</p>
      </div>
    )
  }

  if (isLoading || !detail) return <DetailSkeleton />

  const passedCount = detail.matchAnalysis.filter((m) => m.passed).length

  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/50 p-5">
      <div className="">
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-stretch border-t border-[#232D47]">
          <div className="flex-1 py-4">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[detail.status]}`}>{detail.status}</span>
              <span className="text-sm font-semibold text-white">{detail.reference}</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {detail.date ? new Date(detail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Print"
            onClick={() => window.print()}
            className="flex cursor-pointer items-center justify-center p-4 text-slate-400 hover:text-white"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-t border-b border-[#232D47]">
          <div className="py-4">
            <p className="text-xl font-bold text-emerald-400">{detail.ledgerAmount != null ? formatCurrency(detail.ledgerAmount) : '—'}</p>
            <p className="mt-1 text-xs text-slate-400">Internal Ledger</p>
          </div>
          <div className="relative py-4 text-center">
            <span className="absolute inset-y-2 left-0 w-px bg-[#232D47]" />
            <p className="text-xl font-bold text-red-400">{detail.difference != null ? formatCurrency(Math.abs(detail.difference)) : '—'}</p>
            <p className="mt-1 text-xs text-slate-400">Difference</p>
          </div>
          <div className="relative py-4 text-end">
            <span className="absolute inset-y-2 left-0 w-px bg-[#232D47]" />
            <p className="text-xl font-bold text-sky-400">{detail.counterpartyAmount != null ? formatCurrency(detail.counterpartyAmount) : '—'}</p>
            <p className="mt-1 text-xs text-slate-400">Counterparty</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6 border-b border-[#232D47]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`cursor-pointer border-b-2 pb-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Description</span>
            <span className="font-medium text-slate-200">{detail.description || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Reference</span>
            <span className="font-medium text-slate-200">{detail.reference}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Date</span>
            <span className="font-medium text-slate-200">
              {detail.date ? new Date(detail.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          {detail.rawA && Object.keys(detail.rawA).length > 0 ? (
            Object.entries(detail.rawA).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-200">{value || '—'}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No ledger record for this transaction.</p>
          )}
        </div>
      )}

      {activeTab === 'counterparty' && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#232D47] p-4">
          {detail.rawB && Object.keys(detail.rawB).length > 0 ? (
            Object.entries(detail.rawB).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-200">{value || '—'}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No counterparty record for this transaction.</p>
          )}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-[#232D47] p-4">
        <h4 className="text-sm font-semibold text-white">Match Analysis</h4>
        <ul className="mt-3 space-y-2.5">
          {detail.matchAnalysis.map(({ text, passed }, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-slate-200">
              {passed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <CircleDot className="h-4 w-4 shrink-0 text-red-400" />
              )}
              {text}
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-[#232D47] pt-3 text-xs text-slate-500">
          {passedCount} of {detail.matchAnalysis.length} checks passed
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-[#2E3A5C] p-4">
        <h4 className="text-sm font-semibold text-white">Recommended Action</h4>
        <p className="mt-2 text-sm text-slate-400">{detail.recommendedAction}</p>
      </div>

      <div className="mt-5 border-t border-[#232D47] pt-4">
        <button
          type="button"
          onClick={() => markReviewed.mutate({ id: reportId, rowId, reviewed: !detail.reviewed })}
          disabled={markReviewed.isPending}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
            detail.reviewed
              ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
          }`}
        >
          {markReviewed.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {detail.reviewed ? 'Reviewed' : 'Mark as Reviewed'}
        </button>
      </div>
    </div>
  )
}
