'use client'

import { CalendarClock, Percent } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export type ReconDefaultsDraft = {
  defaultAmountTolerance: string
  defaultDateToleranceDays: string
}

type SettingsReconciliationDefaultsProps = {
  draft: ReconDefaultsDraft
  onChange: (draft: ReconDefaultsDraft) => void
  isLoading?: boolean
}

export default function SettingsReconciliationDefaults({ draft, onChange, isLoading }: SettingsReconciliationDefaultsProps) {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Default Reconciliation Settings</h3>

      <div className="mt-2 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              <Percent className="h-4 w-4" />
            </span>
            <span className="text-sm text-slate-200">Default Match Tolerance</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-24 rounded-lg" />
          ) : (
            <div className="flex items-center overflow-hidden rounded-lg border border-[#232D47] bg-[#0A1128]">
              <input
                type="text"
                inputMode="decimal"
                value={draft.defaultAmountTolerance}
                onChange={(e) => onChange({ ...draft, defaultAmountTolerance: e.target.value })}
                className="w-16 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
              />
              <span className="border-l border-[#232D47] px-3 py-2 text-sm text-slate-400">%</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <CalendarClock className="h-4 w-4" />
            </span>
            <span className="text-sm text-slate-200">Default Date Tolerance</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-24 rounded-lg" />
          ) : (
            <div className="flex items-center overflow-hidden rounded-lg border border-[#232D47] bg-[#0A1128]">
              <input
                type="text"
                inputMode="numeric"
                value={draft.defaultDateToleranceDays}
                onChange={(e) => onChange({ ...draft, defaultDateToleranceDays: e.target.value })}
                className="w-16 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
              />
              <span className="border-l border-[#232D47] px-3 py-2 text-sm text-slate-400">days</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
