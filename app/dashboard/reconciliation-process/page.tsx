'use client'

import { useState } from 'react'
import ColumnMappingBoard from '@/components/dashboard/reconcile/ColumnMappingBoard'
import MatchingRulesSidebar from '@/components/dashboard/reconcile/MatchingRulesSidebar'

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
          <div className="flex min-h-150 items-center justify-center rounded-2xl border border-dashed border-[#232D47] bg-[#0E182D]/40 text-sm text-slate-500">
            Step 2 content placeholder
          </div>
          <div className="flex min-h-150 items-center justify-center rounded-2xl border border-dashed border-[#232D47] bg-[#0E182D]/40 text-sm text-slate-500">
            Step 2 content placeholder
          </div>
        </div>
      )}
    </div>
  )
}

export default page
