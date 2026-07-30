'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  Search,
  SlidersHorizontal,
  InfoIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReport, useRulePreview, useUpdateDraft } from '@/lib/hooks/useReports'
import { useCreateMatchRuleTemplate } from '@/lib/hooks/useMatchRuleTemplates'
import { useWizardStore } from '@/stores/wizard-store'
import { formatNumber } from '@/lib/format'
import { toast } from '@/lib/toast'
import type { RuleConfig } from '@/types/wizard'

const DEFAULT_RULE_CONFIG: RuleConfig = {
  amountTolerance: 0.5,
  dateToleranceDays: 1,
  sameCurrencyOnly: true,
  ignoreCase: true,
  ignoreSpaces: true,
  trimLeadingZeros: true,
  duplicateHandling: 'keep-first',
}

const dateToleranceOptions = ['0 days', '1 day', '2 days', '3 days']

const duplicateHandlingOptions: { value: RuleConfig['duplicateHandling'] & string; label: string }[] = [
  { value: 'keep-first', label: 'Keep First Match' },
  { value: 'keep-last', label: 'Keep Last Match' },
  { value: 'flag-all', label: 'Flag All Duplicates' },
  { value: 'skip', label: 'Skip Duplicates' },
]

const toggles = [
  { key: 'sameCurrencyOnly', label: 'Same Currency Only', tooltip: 'Only match transactions in the same currency' },
  { key: 'ignoreCase', label: 'Ignore Case', tooltip: 'Ignore letter casing when comparing text fields' },
  { key: 'ignoreSpaces', label: 'Ignore Spaces', tooltip: 'Ignore leading/trailing whitespace when comparing text fields' },
  { key: 'trimLeadingZeros', label: 'Trim Leading Zeros', tooltip: 'Ignore leading zeros when comparing reference numbers' },
] as const

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-300">{children}</span>
      <Info className="h-3.5 w-3.5 text-slate-500" />
    </div>
  )
}

type MatchingRulesSidebarProps = {
  reportId: string
}

export default function MatchingRulesSidebar({ reportId }: MatchingRulesSidebarProps) {
  // Hydrated from the draft's own persisted config (set either by a
  // previously-saved template or a prior "Save Draft") when one exists —
  // derived at render time rather than via an effect+setState, same
  // pattern as ColumnMappingBoard's field selections: an override, once the
  // user actually touches a control, wins over whatever was loaded.
  const { data: report } = useReport(reportId)
  const savedConfig = report?.config

  const [amountToleranceOverride, setAmountToleranceOverride] = useState<number | undefined>(undefined)
  const [dateToleranceOverride, setDateToleranceOverride] = useState<string | undefined>(undefined)
  const [toggleOverrides, setToggleOverrides] = useState<Partial<Record<string, boolean>>>({})
  const [duplicateHandlingOverride, setDuplicateHandlingOverride] = useState<(RuleConfig['duplicateHandling'] & string) | undefined>(undefined)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const amountTolerance = amountToleranceOverride ?? savedConfig?.amountTolerance ?? DEFAULT_RULE_CONFIG.amountTolerance
  const dateTolerance =
    dateToleranceOverride ?? dateToleranceOptions[savedConfig?.dateToleranceDays ?? DEFAULT_RULE_CONFIG.dateToleranceDays!]
  const toggleState = {
    sameCurrencyOnly: toggleOverrides.sameCurrencyOnly ?? savedConfig?.sameCurrencyOnly ?? DEFAULT_RULE_CONFIG.sameCurrencyOnly,
    ignoreCase: toggleOverrides.ignoreCase ?? savedConfig?.ignoreCase ?? DEFAULT_RULE_CONFIG.ignoreCase,
    ignoreSpaces: toggleOverrides.ignoreSpaces ?? savedConfig?.ignoreSpaces ?? DEFAULT_RULE_CONFIG.ignoreSpaces,
    trimLeadingZeros: toggleOverrides.trimLeadingZeros ?? savedConfig?.trimLeadingZeros ?? DEFAULT_RULE_CONFIG.trimLeadingZeros,
  }
  const duplicateHandling = duplicateHandlingOverride ?? savedConfig?.duplicateHandling ?? DEFAULT_RULE_CONFIG.duplicateHandling!

  const setRuleConfig = useWizardStore((s) => s.setRuleConfig)
  const columnMapping = useWizardStore((s) => s.columnMapping)
  const isMappingReady = Boolean(
    columnMapping?.fileA.referenceNumber && columnMapping?.fileA.amount && columnMapping?.fileA.transactionDate &&
    columnMapping?.fileB.referenceNumber && columnMapping?.fileB.amount && columnMapping?.fileB.transactionDate,
  )

  const ruleConfig: RuleConfig = {
    amountTolerance,
    dateToleranceDays: dateToleranceOptions.indexOf(dateTolerance) as 0 | 1 | 2 | 3,
    sameCurrencyOnly: toggleState.sameCurrencyOnly,
    ignoreCase: toggleState.ignoreCase,
    ignoreSpaces: toggleState.ignoreSpaces,
    trimLeadingZeros: toggleState.trimLeadingZeros,
    duplicateHandling,
  }

  useEffect(() => {
    setRuleConfig(ruleConfig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountTolerance, dateTolerance, toggleState.sameCurrencyOnly, toggleState.ignoreCase, toggleState.ignoreSpaces, toggleState.trimLeadingZeros, duplicateHandling])

  const rulePreview = useRulePreview()
  const ruleConfigKey = JSON.stringify(ruleConfig)
  const columnMappingKey = JSON.stringify(columnMapping)

  // Fires on every slider tick / toggle flip, debounced — matches the
  // backend's own expectation (rule-preview is cheap, sample-based) while
  // avoiding a network call per pixel of drag.
  useEffect(() => {
    if (!isMappingReady || !columnMapping) return
    const timer = setTimeout(() => {
      rulePreview.mutate({ id: reportId, input: { columnMapping, config: ruleConfig } })
    }, 450)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, isMappingReady, ruleConfigKey, columnMappingKey])

  const preview = rulePreview.data
  const matchPreviewStats = [
    {
      label: 'Estimated Matches',
      value: preview ? formatNumber(preview.estimatedMatches) : '—',
      Icon: CheckCircle2,
      tint: 'bg-emerald-500/15 text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'Possible Mismatches',
      value: preview ? formatNumber(preview.possibleMismatches) : '—',
      Icon: AlertTriangle,
      tint: 'bg-amber-500/15 text-amber-400',
      valueColor: 'text-amber-400',
    },
    {
      label: 'Potential Duplicates',
      value: preview ? formatNumber(preview.potentialDuplicates) : '—',
      Icon: Copy,
      tint: 'bg-violet-500/15 text-violet-400',
      valueColor: 'text-violet-400',
    },
    {
      label: 'Missing References',
      value: preview ? formatNumber(preview.missingReferences) : '—',
      Icon: Search,
      tint: 'bg-red-500/15 text-red-400',
      valueColor: 'text-red-400',
    },
  ]

  const createTemplate = useCreateMatchRuleTemplate()
  const updateDraft = useUpdateDraft()

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return
    createTemplate.mutate(
      { name: templateName.trim(), config: ruleConfig },
      {
        onSuccess: () => {
          toast.success('Template saved')
          setTemplateDialogOpen(false)
          setTemplateName('')
        },
      },
    )
  }

  const handleSaveDraft = () => {
    updateDraft.mutate(
      { id: reportId, input: { config: ruleConfig, columnMapping } },
      { onSuccess: () => toast.success('Draft saved') },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B2540] text-slate-300">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-white">Matching Rules</h3>
        </div>

        <div className="divide-y divide-[#1B2540] [&>div]:py-5 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <FieldLabel>Amount Tolerance</FieldLabel>
              <span className="rounded-md border border-[#232D47] bg-[#0D152A] px-2.5 py-1 font-mono text-xs text-slate-200">
                ± {amountTolerance.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">0.00</span>
              <Slider
                value={amountTolerance}
                onValueChange={(value) => setAmountToleranceOverride(value)}
                min={0}
                max={1}
                step={0.01}
                className="[&_[data-slot=slider-track]]:bg-[#1B2540] [&_[data-slot=slider-range]]:bg-emerald-400 [&_[data-slot=slider-thumb]]:border-emerald-400"
              />
              <span className="text-xs text-slate-500">1.00</span>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <FieldLabel>Date Tolerance</FieldLabel>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {dateToleranceOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDateToleranceOverride(option)}
                  className={`cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    dateTolerance === option
                      ? 'border-sky-500 text-sky-400'
                      : 'border-[#232D47] text-slate-300 hover:border-[#2E3A5C]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {toggles.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <FieldLabel>{label}</FieldLabel>
                <Switch
                  checked={toggleState[key]}
                  onCheckedChange={(checked) => setToggleOverrides((prev) => ({ ...prev, [key]: checked }))}
                  className="data-checked:bg-emerald-500"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2">
              <FieldLabel>Duplicate Handling</FieldLabel>
            </div>
            <Select value={duplicateHandling} onValueChange={(value) => value && setDuplicateHandlingOverride(value as typeof duplicateHandling)}>
              <SelectTrigger className="h-9 w-full justify-between border-[#232D47] bg-[#0B122B] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {duplicateHandlingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <h3 className="mb-4 text-base font-semibold text-white">
          Match Preview <span className="text-sm font-normal text-slate-400">(Estimated)</span>
        </h3>

        <ul>
          {matchPreviewStats.map(({ label, value, Icon, tint, valueColor }) => (
            <li key={label} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
              <span className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </span>
              <span className={`text-lg font-semibold ${valueColor}`}>{value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2 border-t border-[#1B2540] pt-4 text-xs text-slate-400">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 text-red-500 shrink-0" />
          <p>Estimates are based on current mapping and rules. Actual results may vary.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setTemplateDialogOpen(true)}
          className="cursor-pointer border-[#232D47] bg-transparent p-4 hover:text-white text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
        >
          Save Template
        </Button>
        <Button
          type="button"
          onClick={handleSaveDraft}
          disabled={updateDraft.isPending}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateDraft.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Draft
        </Button>
      </div>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-white">Save as Template</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Save these matching rules to reuse on a future reconciliation.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            maxLength={100}
            className="w-full rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim() || createTemplate.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createTemplate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
