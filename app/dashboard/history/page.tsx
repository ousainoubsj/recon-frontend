import type { Metadata } from 'next'
import HistoryPageClient from '@/components/dashboard/HistoryPageClient'

export const metadata: Metadata = {
  title: 'History',
}

export default function Page() {
  return <HistoryPageClient />
}
