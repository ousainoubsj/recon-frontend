'use client'

import { useEffect, useState } from 'react'
import ColumnMappingBoard from './ColumnMappingBoard'
import MatchingRulesSidebar from './MatchingRulesSidebar'
import ReconciliationProgress from './ReconciliationProgress'
import ReconciliationResults from './ReconciliationResults'
import TransactionExplorerBoard, { type FilterKey } from './TransactionExplorerBoard'
import TransactionExplorerSidebar from './TransactionExplorerSidebar'
import { useMappingPreview, useReport, useRunReconciliation, useUpdateDraft } from '@/lib/hooks/useReports'
import { useWizardStore } from '@/stores/wizard-store'
import { toastApiError } from '@/lib/toast'
import { LogoLoader } from '@/components/ui/logo-loader'
import type { CompleteColumnMapping } from '@/types/wizard'

type Step = 1 | 3 | 4

export default function ReconciliationWizard({ reportId }: { reportId: string }) {
  const { data: report, isLoading: isReportLoading } = useReport(reportId)
  // Mapping preview only exists for a draft/failed run (getMappingPreview
  // 404s otherwise) — it's only actually needed for the mapping step and the
  // transient "running" screen, both of which only happen on such a report.
  // Fetching it unconditionally meant simply opening a completed report
  // (e.g. via History's "View Result") always threw a spurious
  // NotFoundError for this call alone.
  //
  // `processing` gets the id (so the running screen keeps reading the same
  // cache entry the mapping step already populated — file row counts stay
  // visible) but not a fresh fetch (`enabled: false`): a *new*
  // getMappingPreview call during processing would 404 the same way a
  // completed report's would, since the backend only serves this for
  // draft/failed. If there's nothing cached yet (e.g. the page was loaded
  // fresh mid-run), the row counts just show as "—" instead of erroring.
  const canPreviewMapping = report?.status === 'draft' || report?.status === 'failed' || report?.status === 'processing'
  const canFetchMappingPreview = report?.status === 'draft' || report?.status === 'failed'
  const { data: mappingPreview } = useMappingPreview(canPreviewMapping ? reportId : undefined, {
    enabled: canFetchMappingPreview,
  })

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
  const [isRowAutoSelected, setIsRowAutoSelected] = useState(false)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [explorerFilter, setExplorerFilter] = useState<FilterKey>('all')

  const updateDraft = useUpdateDraft()
  const runReconciliation = useRunReconciliation()

  // A reconciliation run now executes in a background worker — the /run
  // mutation itself resolves almost instantly (it just enqueues the job),
  // so "still running" has to account for the polled report sitting in
  // `processing` too, not just the mutation's own in-flight state.
  const isRunning = runReconciliation.isPending || report?.status === 'processing'

  useEffect(() => {
    setIsRunning(isRunning)
  }, [isRunning, setIsRunning])

  // Advances to Results the moment a background run actually finishes.
  // Replaces the old onSuccess-on-the-mutation approach — the mutation now
  // resolves the instant the run is enqueued, long before the worker has
  // even picked up (let alone finished) the real work.
  // Adjusted during render rather than in an effect; the persistedStep sync effect below picks up the new step.
  const [prevStatus, setPrevStatus] = useState(report?.status)
  if (report?.status !== prevStatus) {
    setPrevStatus(report?.status)
    if (prevStatus === 'processing' && report?.status === 'completed') setManualStep(3)
  }

  // Resets the in-progress mapping/rule-config cache when switching to a
  // different report than whatever was last being edited here (e.g.
  // starting a fresh upload before finishing a previous draft), so stale
  // state from a different report can't leak in. This component's own local
  // step/selection state resets for free — see the `key={reportId}` on the
  // render site in page.tsx, which fully remounts this component on a
  // reportId change rather than reusing the instance across reports.
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

  // Keeps Header's ReconciliationStepper (reads persistedStep directly, has
  // no view into this component's own step derivation) in sync even when
  // step comes from server truth rather than an explicit goToStep call —
  // e.g. opening an already-completed report jumps straight to Results
  // without ever calling goToStep.
  useEffect(() => {
    if (step !== null) setPersistedStep(step)
  }, [step, setPersistedStep])

  const goToStep = (next: Step) => {
    setManualStep(next)
    setPersistedStep(next)
  }

  const handleContinue = async (name: string) => {
    if (!columnMapping || !ruleConfig) return
    try {
      await updateDraft.mutateAsync({ id: reportId, input: { name: name || undefined, columnMapping, config: ruleConfig } })
      runReconciliation.mutate({
        id: reportId,
        input: { name: name || undefined, columnMapping: columnMapping as CompleteColumnMapping, config: ruleConfig },
      })
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

  if (isRunning) {
    return (
      <div className="flex-1 p-6">
        <ReconciliationProgress
          fileARows={mappingPreview?.fileA.rows}
          fileBRows={mappingPreview?.fileB.rows}
          progressPercent={report.status === 'processing' ? report.progress : undefined}
        />
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
            isSubmitting={updateDraft.isPending || isRunning}
            submitError={
              runReconciliation.isError
                ? 'Failed to start reconciliation. Please try again.'
                : report.status === 'failed'
                  ? (report.errorMessage ?? 'The reconciliation run failed. Please try again.')
                  : null
            }
          />
          <MatchingRulesSidebar reportId={reportId} />
        </div>
      )}

      {step === 3 && (
        <ReconciliationResults
          reportId={reportId}
          onGoToExplorer={(opts) => {
            if (opts?.rowId) {
              setSelectedRowId(opts.rowId)
              setIsRowAutoSelected(false)
            } else {
              // No specific row requested (Quick Actions / generic explorer
              // card) — clear any stale selection so the board's own
              // auto-select effect picks a fresh first row for this filter.
              setSelectedRowId(undefined)
            }
            setExplorerFilter(opts?.filter ?? 'all')
            goToStep(4)
          }}
        />
      )}

      {step === 4 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
          <TransactionExplorerBoard
            reportId={reportId}
            selectedRowId={selectedRowId}
            onSelectRow={(rowId, opts) => {
              setSelectedRowId(rowId)
              setIsRowAutoSelected(Boolean(opts?.auto))
            }}
            onBackToResults={() => goToStep(3)}
            initialFilter={explorerFilter}
            onLoadingChange={setIsTransactionsLoading}
          />
          <TransactionExplorerSidebar
            reportId={reportId}
            rowId={selectedRowId}
            columnMapping={report?.columnMapping ?? null}
            isAutoSelected={isRowAutoSelected}
            isTableLoading={isTransactionsLoading}
            onClose={() => setSelectedRowId(undefined)}
            onSelectRow={(rowId) => {
              setSelectedRowId(rowId)
              setIsRowAutoSelected(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
