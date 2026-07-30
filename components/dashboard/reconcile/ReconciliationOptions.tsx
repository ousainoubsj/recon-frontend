'use client'

import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useDrafts } from '@/lib/hooks/useReports'
import { useMatchRuleTemplates } from '@/lib/hooks/useMatchRuleTemplates'

type OptionAction = 'upload' | 'draft' | 'template' | 'sample'

const options: {
  icon: string
  title: string
  description: string
  cta: string
  action: OptionAction
  highlighted?: boolean
  badgeColor?: string
}[] = [
  {
    icon: '/icons/upload.png',
    title: 'Upload New Files',
    description: 'Upload two files and configure matching rules.',
    cta: 'Start Reconciliation',
    action: 'upload',
    highlighted: true,
  },
  {
    icon: '/icons/draft.png',
    title: 'Continue Draft',
    description: 'Continue an unfinished reconciliation.',
    cta: 'View Drafts',
    action: 'draft',
    badgeColor: 'bg-violet-500',
  },
  {
    icon: '/icons/saved.png',
    title: 'Saved Template',
    description: 'Use a template with pre-configured rules.',
    cta: 'Browse Templates',
    action: 'template',
    badgeColor: 'bg-blue-500',
  },
  {
    icon: '/icons/sample.png',
    title: 'Sample Dataset',
    description: 'Try a sample reconciliation with example datasets.',
    cta: 'Try Sample',
    action: 'sample',
  },
]

type ReconciliationOptionsProps = {
  onUpload: () => void
  onContinueDraft: () => void
  onSavedTemplate: () => void
  onTrySample: () => void
  isSampleLoading: boolean
}

export default function ReconciliationOptions({
  onUpload,
  onContinueDraft,
  onSavedTemplate,
  onTrySample,
  isSampleLoading,
}: ReconciliationOptionsProps) {
  const { data: drafts } = useDrafts()
  const { data: templates } = useMatchRuleTemplates()
  const badgeCounts: Partial<Record<OptionAction, number>> = {
    draft: drafts?.length,
    template: templates?.length,
  }

  const handleAction = (action: OptionAction) => {
    switch (action) {
      case 'upload':
        onUpload()
        break
      case 'draft':
        onContinueDraft()
        break
      case 'template':
        onSavedTemplate()
        break
      case 'sample':
        onTrySample()
        break
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {options.map(({ icon, title, description, cta, action, highlighted, badgeColor }) => {
        const isSample = action === 'sample'
        const isLoading = isSample && isSampleLoading
        return (
          <div
            key={title}
            className={`relative flex flex-col rounded-2xl border bg-[#0D1230]/70 p-6 ${
              highlighted ? 'border-teal-400/70 shadow-[0_0_30px_-8px_rgba(45,212,191,0.5)]' : 'border-[#232D47]'
            }`}
          >
            {!!badgeCounts[action] && (
              <span
                className={`absolute top-4 right-4 flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-semibold text-white ${badgeColor}`}
              >
                {badgeCounts[action]}
              </span>
            )}

            <div className="flex flex-1 flex-col items-center text-center">
              <Image src={icon} alt="" width={110} height={110} className="h-24 w-24" />
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-[#A3B2C8]">{description}</p>
            </div>

            <TruncateTooltip
              as="button"
              type="button"
              onClick={() => handleAction(action)}
              disabled={isLoading}
              className={`mt-6 flex cursor-pointer truncate items-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                isLoading ? 'justify-center gap-1' : 'justify-between'
              } ${
                highlighted
                  ? 'bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 shadow-md shadow-indigo-500/20 hover:opacity-90'
                  : 'border border-[#232D47] hover:bg-white/5'
              }`}
              tooltip={cta}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Loading Sample...
                </>
              ) : (
                <>
                  {cta}
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </>
              )}
            </TruncateTooltip>
          </div>
        )
      })}
    </div>
  )
}
