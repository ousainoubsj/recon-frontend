import ReconciliationHeaderMid from '@/components/dashboard/reconcile/ReconciliationHeaderMid'
import ReconciliationOptions from '@/components/dashboard/reconcile/ReconciliationOptions'
import ReconciliationTips from '@/components/dashboard/reconcile/ReconciliationTips'

export default function Page() {
  return (
    <main className="flex-1 px-6">
      <div className="flex rounded-t-xl flex-col py-6 gap-6 lg:flex-row bg-linear-to-b from-[#040E26] via-transparent to-transparent">
        <div className="flex min-h-200 w-full flex-1 flex-col gap-2 p-6">
          <ReconciliationHeaderMid />
          <ReconciliationOptions />
        </div>

        <ReconciliationTips />
      </div>
    </main>
  )
}
