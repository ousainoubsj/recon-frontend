import ReconciliationTips from '@/components/dashboard/reconcile/ReconciliationTips'

export default function Page() {
  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-h-150 flex-1 items-center justify-center rounded-2xl border border-dashed border-[#232D47] bg-[#0E182D] p-6">
          <p className="text-sm text-slate-500">Left content placeholder</p>
        </div>

        <ReconciliationTips />
      </div>
    </main>
  )
}
