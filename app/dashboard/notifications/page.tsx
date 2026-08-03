import type { Metadata } from 'next'
import NotificationsPageClient from '@/components/dashboard/NotificationsPageClient'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default function Page() {
  return <NotificationsPageClient />
}
