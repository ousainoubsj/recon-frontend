'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UploadRecords from '@/components/dashboard/UploadRecords'
import ContinueDraftDialog from './ContinueDraftDialog'
import SavedTemplateDialog from './SavedTemplateDialog'
import ReconciliationOptions from './ReconciliationOptions'
import ReconciliationRecentActivity from './ReconciliationRecentActivity'
import { useCreateDraft } from '@/lib/hooks/useReports'
import { useRecordTemplateUsage } from '@/lib/hooks/useMatchRuleTemplates'
import { useUploadFiles } from '@/lib/hooks/useUploadFiles'
import { toastApiError } from '@/lib/toast'
import type { Report } from '@/types/reports'
import type { MatchRuleTemplate } from '@/types/matchRuleTemplates'

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

// Owns the three dialogs (and the state that opens them) so ReconciliationOptions'
// cards and ReconciliationRecentActivity's "View all templates"/"View all
// drafts" links can both open the exact same dialog instances, instead of
// each maintaining its own separate copy.
function LauncherInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [draftOpen, setDraftOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateDraftId, setTemplateDraftId] = useState<string | undefined>(undefined)
  const [isSampleLoading, setIsSampleLoading] = useState(false)

  const createDraft = useCreateDraft()
  const uploadFiles = useUploadFiles()
  const recordTemplateUsage = useRecordTemplateUsage()

  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setUploadOpen(true)
      router.replace('/dashboard/reconcile')
    }
  }, [searchParams, router])

  const goToWizard = (reportId: string) => router.push(`/dashboard/reconciliation-process/${reportId}`)

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
    <>
      <ReconciliationOptions
        onUpload={() => setUploadOpen(true)}
        onContinueDraft={() => setDraftOpen(true)}
        onSavedTemplate={() => setTemplateOpen(true)}
        onTrySample={handleTrySample}
        isSampleLoading={isSampleLoading}
      />

      <div className="mt-6">
        <ReconciliationRecentActivity
          onViewAllTemplates={() => setTemplateOpen(true)}
          onViewAllDrafts={() => setDraftOpen(true)}
        />
      </div>

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
    </>
  )
}

export default function ReconciliationLauncher() {
  return (
    <Suspense fallback={null}>
      <LauncherInner />
    </Suspense>
  )
}
