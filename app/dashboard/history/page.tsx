import HistoryHeader from '@/components/dashboard/HistoryHeader'
import HistorySidebar from '@/components/dashboard/HistorySidebar'
import HistoryStats from '@/components/dashboard/HistoryStats'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <HistoryHeader />
          <HistoryStats />
        </div>

        <HistorySidebar />
      </div>
    </div>
  )
}
