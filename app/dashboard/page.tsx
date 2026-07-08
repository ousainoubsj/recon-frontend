import GreetingBanner from '@/components/dashboard/GreetingBanner'
import StatsOverview from '@/components/dashboard/StatsOverview'

export default function Page() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <GreetingBanner />
      <StatsOverview />
    </main>
  )
}
