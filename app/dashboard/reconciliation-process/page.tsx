'use client'

import { useState } from 'react'
import ColumnMappingBoard from '@/components/dashboard/reconcile/ColumnMappingBoard'
import LiveProcessLog from '@/components/dashboard/reconcile/LiveProcessLog'
import MatchingRulesSidebar from '@/components/dashboard/reconcile/MatchingRulesSidebar'
import ProcessingSidebar from '@/components/dashboard/reconcile/ProcessingSidebar'
import ReconciliationProgress from '@/components/dashboard/reconcile/ReconciliationProgress'
import ReconciliationResults from '@/components/dashboard/reconcile/ReconciliationResults'
import TransactionExplorerBoard from '@/components/dashboard/reconcile/TransactionExplorerBoard'
import TransactionExplorerSidebar from '@/components/dashboard/reconcile/TransactionExplorerSidebar'

const page = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  return (
    <div className="flex-1 p-6">
      {step === 1 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <ColumnMappingBoard onContinue={() => setStep(2)} />
          <MatchingRulesSidebar />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <ReconciliationProgress onViewResults={() => setStep(3)} />
            <LiveProcessLog />
          </div>
          <ProcessingSidebar />
        </div>
      )}

      {step === 3 && <ReconciliationResults onGoToExplorer={() => setStep(4)} />}

      {step === 4 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
          <TransactionExplorerBoard />
          <TransactionExplorerSidebar />
        </div>
      )}
    </div>
  )
}

export default page
