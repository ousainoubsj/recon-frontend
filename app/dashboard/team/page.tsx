import { Users } from 'lucide-react'
import TeamHeader from '@/components/dashboard/TeamHeader'
import TeamUserDetails from '@/components/dashboard/TeamUserDetails'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <TeamHeader />

          <div className="flex min-h-100 flex-col items-center justify-center gap-3 rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/15">
              <Users className="h-7 w-7 text-sky-400" />
            </span>
            <p className="text-sm text-slate-400">This page is coming soon.</p>
          </div>
        </div>

        <TeamUserDetails />
      </div>
    </div>
  )
}
