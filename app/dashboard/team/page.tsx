import TeamHeader from '@/components/dashboard/TeamHeader'
import TeamUserDetails from '@/components/dashboard/TeamUserDetails'
import TeamUsersSection from '@/components/dashboard/TeamUsersSection'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <TeamHeader />
          <TeamUsersSection />
        </div>

        <TeamUserDetails />
      </div>
    </div>
  )
}
