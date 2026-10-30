import type { Metadata } from 'next'
import DashboardHomeSwitch from '@/components/dashboard/DashboardHomeSwitch'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function Page() {
  return <DashboardHomeSwitch />
}
