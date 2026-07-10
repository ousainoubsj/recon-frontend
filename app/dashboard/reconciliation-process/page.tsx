import MatchingRulesSidebar from '@/components/dashboard/reconcile/MatchingRulesSidebar'

const page = () => {
  return (
    <div className="flex-1 p-6">

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-150 items-center justify-center rounded-2xl border border-dashed border-[#232D47] bg-[#0E182D]/40 text-sm text-slate-500">
          Left content placeholder
        </div>

        <MatchingRulesSidebar />
      </div>
    </div>
  )
}

export default page
