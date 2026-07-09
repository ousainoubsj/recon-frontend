import ReconciliationHeaderMid from '@/components/dashboard/reconcile/ReconciliationHeaderMid'
import ReconciliationTips from '@/components/dashboard/reconcile/ReconciliationTips'

export default function Page() {
  return (
    <main className="flex-1 px-6">
      <div className="flex rounded-t-xl flex-col py-6 gap-6 lg:flex-row bg-linear-to-b from-[#0A1130] via-transparent to-transparent">
        <div className="flex min-h-200 flex-1 p-6">
          <ReconciliationHeaderMid />
        </div>

        <ReconciliationTips />
      </div>
    </main>
  )
}
