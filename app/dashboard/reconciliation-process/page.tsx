'use client'

import { useState } from 'react'
import ColumnMappingBoard from '@/components/dashboard/reconcile/ColumnMappingBoard'
import LiveProcessLog from '@/components/dashboard/reconcile/LiveProcessLog'
import MatchingRulesSidebar from '@/components/dashboard/reconcile/MatchingRulesSidebar'
import ProcessingSidebar from '@/components/dashboard/reconcile/ProcessingSidebar'
import ReconciliationProgress from '@/components/dashboard/reconcile/ReconciliationProgress'
import { Button } from '@/components/ui/button'

const page = () => {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <div className="flex-1 p-6">
      {step === 1 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <ColumnMappingBoard />
          <MatchingRulesSidebar onContinue={() => setStep(2)} />
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <ReconciliationProgress />
            <LiveProcessLog />

            <Button
              type="button"
              className="w-full cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
            >
              View Results
            </Button>
          </div>
          <ProcessingSidebar />
        </div>
      )}
    </div>
  )
}

export default page
