import ColumnMappingBoard from '@/components/dashboard/reconcile/ColumnMappingBoard'
import MatchingRulesSidebar from '@/components/dashboard/reconcile/MatchingRulesSidebar'

const page = () => {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <ColumnMappingBoard />

        <MatchingRulesSidebar />
      </div>
    </div>
  )
}

export default page
