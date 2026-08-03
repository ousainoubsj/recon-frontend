import type { Metadata } from 'next'
import ReconciliationHeaderMid from '@/components/dashboard/reconcile/ReconciliationHeaderMid'
import ReconciliationLauncher from '@/components/dashboard/reconcile/ReconciliationLauncher'
import ReconciliationTips from '@/components/dashboard/reconcile/ReconciliationTips'

export const metadata: Metadata = {
  title: 'New Reconciliation',
}

export default function Page() {
  return (
    <main className="flex-1 px-6">
      <div className="flex rounded-t-2xl border-t-2 border-l-2 border-[#0D1231] flex-col py-6 gap-6 lg:flex-row bg-linear-to-b from-[#040E26] via-transparent to-transparent">
        <div className="flex min-h-200 w-full flex-1 flex-col gap-2 p-6">
          <ReconciliationHeaderMid />
          <ReconciliationLauncher />
        </div>

        <ReconciliationTips />
      </div>
    </main>
  )
}
