import type { Metadata } from 'next'
import ReportsWorkspace from '@/components/dashboard/ReportsWorkspace'

export const metadata: Metadata = {
  title: 'Reports',
}

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <ReportsWorkspace />
    </div>
  )
}
