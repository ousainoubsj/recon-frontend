'use client'

import { CalendarClock, DollarSign, ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCurrencySymbol } from '@/lib/format'
import type { MatchRuleTemplate } from '@/types/matchRuleTemplates'

export type ReconDefaultsDraft = {
  defaultAmountTolerance: string
  defaultDateToleranceDays: string
}

const NONE_VALUE = '__none__'

type SettingsReconciliationDefaultsProps = {
  draft: ReconDefaultsDraft
  onChange: (draft: ReconDefaultsDraft) => void
  onCommitField: (field: keyof ReconDefaultsDraft, value: string) => void
  isLoading?: boolean
  currency?: string
  // Only an admin may designate the org's enforced template — non-admins get
  // this section hidden entirely rather than shown read-only, since they
  // have no action to take here.
  isAdmin?: boolean
  templates?: MatchRuleTemplate[]
  isTemplatesLoading?: boolean
  enforcedTemplateId?: string | null
  onSelectEnforcedTemplate?: (templateId: string | null) => void
}

export default function SettingsReconciliationDefaults({
  draft,
  onChange,
  onCommitField,
  isLoading,
  currency = 'USD',
  isAdmin,
  templates,
  isTemplatesLoading,
  enforcedTemplateId,
  onSelectEnforcedTemplate,
}: SettingsReconciliationDefaultsProps) {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <h3 className="text-lg font-semibold text-white">Default Reconciliation Settings</h3>

      <div className="mt-2 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
              <DollarSign className="h-4 w-4" />
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
                onBlur={() => onCommitField('defaultAmountTolerance', draft.defaultAmountTolerance)}
                className="w-16 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
              />
              <span className="border-l border-[#232D47] px-3 py-2 text-sm text-slate-400">{getCurrencySymbol(currency)}</span>
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
                onBlur={() => onCommitField('defaultDateToleranceDays', draft.defaultDateToleranceDays)}
                className="w-16 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
              />
              <span className="border-l border-[#232D47] px-3 py-2 text-sm text-slate-400">days</span>
            </div>
          )}
        </div>

        {isAdmin && (
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-slate-200">Default Matching-Rules Template</p>
                <p className="text-xs text-slate-500">Members are locked to this template&apos;s rules if set.</p>
              </div>
            </div>
            {isTemplatesLoading ? (
              <Skeleton className="h-9 w-full rounded-lg" />
            ) : (
              <Select
                value={enforcedTemplateId ?? NONE_VALUE}
                onValueChange={(value) => onSelectEnforcedTemplate?.(value === NONE_VALUE ? null : (value ?? null))}
                items={{
                  [NONE_VALUE]: 'None — members edit freely',
                  ...Object.fromEntries((templates ?? []).map((t) => [t.id, t.name])),
                }}
              >
                <SelectTrigger className="h-9 w-full justify-between border-[#232D47] bg-[#0A1128] text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE} className="text-slate-400 italic">
                    None — members edit freely
                  </SelectItem>
                  {(templates ?? []).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
