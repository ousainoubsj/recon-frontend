'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import UploadRecords from '@/components/dashboard/UploadRecords'
import ContinueDraftDialog from '@/components/dashboard/reconcile/ContinueDraftDialog'
import SavedTemplateDialog from '@/components/dashboard/reconcile/SavedTemplateDialog'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useDrafts, useCreateDraft } from '@/lib/hooks/useReports'
import { useMatchRuleTemplates, useRecordTemplateUsage } from '@/lib/hooks/useMatchRuleTemplates'
import { useUploadFiles } from '@/lib/hooks/useUploadFiles'
import { toastApiError } from '@/lib/toast'
import type { Report } from '@/types/reports'
import type { MatchRuleTemplate } from '@/types/matchRuleTemplates'

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

// Bundled fixture files with matching/mismatching/duplicate/missing
// reference numbers hand-crafted so a real run produces an interesting
// result — fetched client-side and fed into the exact same upload path as
// a manual pick, not a separate canned-results screen.
const SAMPLE_INTERNAL_URL = '/samples/sample-internal-ledger.csv'
const SAMPLE_COUNTERPARTY_URL = '/samples/sample-counterparty-statement.csv'

async function fetchSampleFiles() {
  const [internalRes, counterpartyRes] = await Promise.all([fetch(SAMPLE_INTERNAL_URL), fetch(SAMPLE_COUNTERPARTY_URL)])
  const [internalBlob, counterpartyBlob] = await Promise.all([internalRes.blob(), counterpartyRes.blob()])
  return {
    internal: new File([internalBlob], 'sample-internal-ledger.csv', { type: 'text/csv' }),
    counterparty: new File([counterpartyBlob], 'sample-counterparty-statement.csv', { type: 'text/csv' }),
  }
}

export default function ReconciliationOptions() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [draftOpen, setDraftOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateDraftId, setTemplateDraftId] = useState<string | undefined>(undefined)
  const [isSampleLoading, setIsSampleLoading] = useState(false)

  const { data: drafts } = useDrafts()
  const { data: templates } = useMatchRuleTemplates()
  const createDraft = useCreateDraft()
  const uploadFiles = useUploadFiles()
  const recordTemplateUsage = useRecordTemplateUsage()
  const badgeCounts: Partial<Record<OptionAction, number>> = {
    draft: drafts?.length,
    template: templates?.length,
  }

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setUploadOpen(true)
      router.replace('/dashboard/reconcile')
    }
  }, [searchParams, router])

  const goToWizard = (reportId: string) => router.push(`/dashboard/reconciliation-process/${reportId}`)

  const handleAction = (action: OptionAction) => {
    switch (action) {
      case 'upload':
        setUploadOpen(true)
        break
      case 'draft':
        setDraftOpen(true)
        break
      case 'template':
        setTemplateOpen(true)
        break
      case 'sample':
        handleTrySample()
        break
    }
  }

  const handleTrySample = async () => {
    setIsSampleLoading(true)
    try {
      const { internal, counterparty } = await fetchSampleFiles()
      const id = await uploadFiles.mutateAsync({ internal, counterparty })
      goToWizard(id)
    } catch (err) {
      toastApiError(err, 'Failed to load sample dataset')
    } finally {
      setIsSampleLoading(false)
    }
  }

  const handleResumeDraft = (draft: Report) => {
    setDraftOpen(false)
    goToWizard(draft.id)
  }

  const handleSelectTemplate = async (template: MatchRuleTemplate) => {
    setTemplateOpen(false)
    try {
      const draft = await createDraft.mutateAsync({ config: template.config })
      recordTemplateUsage.mutate(template.id)
      setTemplateDraftId(draft.id)
      setUploadOpen(true)
    } catch (err) {
      toastApiError(err, 'Failed to start from template')
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

      <UploadRecords
        open={uploadOpen}
        onOpenChange={(next) => {
          setUploadOpen(next)
          if (!next) setTemplateDraftId(undefined)
        }}
        draftId={templateDraftId}
        onUploaded={goToWizard}
      />

      <ContinueDraftDialog open={draftOpen} onOpenChange={setDraftOpen} onResume={handleResumeDraft} />

      <SavedTemplateDialog open={templateOpen} onOpenChange={setTemplateOpen} onSelect={handleSelectTemplate} />
    </div>
  )
}
