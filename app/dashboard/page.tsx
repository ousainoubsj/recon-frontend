import type { Metadata } from 'next'
import DashboardHomeClient from '@/components/dashboard/DashboardHomeClient'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function Page() {
  return <DashboardHomeClient />
}
