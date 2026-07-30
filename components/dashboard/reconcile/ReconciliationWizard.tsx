'use client'

import { useEffect, useState } from 'react'
import ColumnMappingBoard from './ColumnMappingBoard'
import MatchingRulesSidebar from './MatchingRulesSidebar'
import ReconciliationProgress from './ReconciliationProgress'
import ReconciliationResults from './ReconciliationResults'
import TransactionExplorerBoard from './TransactionExplorerBoard'
import TransactionExplorerSidebar from './TransactionExplorerSidebar'
import { useMappingPreview, useReport, useRunReconciliation, useUpdateDraft } from '@/lib/hooks/useReports'
import { useWizardStore } from '@/stores/wizard-store'
import { toastApiError } from '@/lib/toast'
import { LogoLoader } from '@/components/ui/logo-loader'
import type { CompleteColumnMapping } from '@/types/wizard'

type Step = 1 | 3 | 4

export default function ReconciliationWizard({ reportId }: { reportId: string }) {
  const { data: report, isLoading: isReportLoading } = useReport(reportId)
  const { data: mappingPreview } = useMappingPreview(reportId)

  const storeReportId = useWizardStore((s) => s.reportId)
  const setStoreReportId = useWizardStore((s) => s.setReportId)
  const persistedStep = useWizardStore((s) => s.step)
  const setPersistedStep = useWizardStore((s) => s.setStep)
  const reset = useWizardStore((s) => s.reset)
  const columnMapping = useWizardStore((s) => s.columnMapping)
  const ruleConfig = useWizardStore((s) => s.ruleConfig)
  const setIsRunning = useWizardStore((s) => s.setIsRunning)

  // Once the user has explicitly navigated (via goToStep), that manual
  // choice wins for the rest of this session. Until then, the step is
  // purely derived from server truth at render time — no effect needed:
  // completed jumps straight to Results regardless of the persisted step;
  // failed goes back to step 1 so the user can retry; draft resumes at the
  // persisted step (or step 1).
  const [manualStep, setManualStep] = useState<Step | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>(undefined)

  const updateDraft = useUpdateDraft()
  const runReconciliation = useRunReconciliation()

  useEffect(() => {
    setIsRunning(runReconciliation.isPending)
  }, [runReconciliation.isPending, setIsRunning])

  // Resets the in-progress mapping/rule-config cache when switching to a
  // different report than whatever was last being edited here (e.g.
  // starting a fresh upload before finishing a previous draft), so stale
  // state from a different report can't leak in.
  useEffect(() => {
    if (storeReportId !== reportId) {
      reset()
      setStoreReportId(reportId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  const serverStep: Step | null = !report
    ? null
    : report.status === 'completed'
      ? 3
      : report.status === 'failed'
        ? 1
        : persistedStep === 4
          ? 1
          : (persistedStep as Step)
  const step = manualStep ?? serverStep

  const goToStep = (next: Step) => {
    setManualStep(next)
    setPersistedStep(next)
  }

  const handleContinue = async (name: string) => {
    if (!columnMapping || !ruleConfig) return
    try {
      await updateDraft.mutateAsync({ id: reportId, input: { name: name || undefined, columnMapping, config: ruleConfig } })
      runReconciliation.mutate(
        { id: reportId, input: { name: name || undefined, columnMapping: columnMapping as CompleteColumnMapping, config: ruleConfig } },
        { onSuccess: () => goToStep(3) },
      )
    } catch (err) {
      toastApiError(err, 'Failed to save draft')
    }
  }

  if (isReportLoading || !report || step === null) {
    return (
      <div className="flex-1 p-6">
        <div className="flex min-h-96 flex-col items-center justify-center gap-4">
          <LogoLoader />
          <p className="text-sm text-slate-400">Loading reconciliation...</p>
        </div>
      </div>
    )
  }

  if (runReconciliation.isPending) {
    return (
      <div className="flex-1 p-6">
        <ReconciliationProgress fileARows={mappingPreview?.fileA.rows} fileBRows={mappingPreview?.fileB.rows} />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      {step === 1 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <ColumnMappingBoard
            reportId={reportId}
            onContinue={handleContinue}
            isSubmitting={updateDraft.isPending || runReconciliation.isPending}
            submitError={runReconciliation.isError ? (report.errorMessage ?? 'The reconciliation run failed. Please try again.') : null}
          />
          <MatchingRulesSidebar reportId={reportId} />
        </div>
      )}

      {step === 3 && <ReconciliationResults reportId={reportId} onGoToExplorer={() => goToStep(4)} />}

      {step === 4 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
          <TransactionExplorerBoard reportId={reportId} selectedRowId={selectedRowId} onSelectRow={setSelectedRowId} />
          <TransactionExplorerSidebar reportId={reportId} rowId={selectedRowId} onClose={() => setSelectedRowId(undefined)} />
        </div>
      )}
    </div>
  )
}
