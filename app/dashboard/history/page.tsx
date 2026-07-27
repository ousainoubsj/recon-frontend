'use client'

import { useState } from 'react'
import HistoryHeader from '@/components/dashboard/HistoryHeader'
import HistorySidebar from '@/components/dashboard/HistorySidebar'
import HistoryStats from '@/components/dashboard/HistoryStats'
import HistoryTable from '@/components/dashboard/HistoryTable'
import { useHistoryStats } from '@/lib/hooks/useReports'
import type { HistoryFilterKey } from '@/lib/historyFilters'

export default function Page() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilterKey>('all')
  const [highlightTableSignal, setHighlightTableSignal] = useState(0)
  const { data: historyStats, isLoading: isHistoryStatsLoading } = useHistoryStats()

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <HistoryHeader />
          <HistoryStats stats={historyStats} isLoading={isHistoryStatsLoading} />
          <HistoryTable activeFilter={activeFilter} highlightSignal={highlightTableSignal} />
        </div>

        <HistorySidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onViewAllFilePairs={() => setHighlightTableSignal((n) => n + 1)}
        />
      </div>
    </div>
  )
}
