import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'

// Everything under /dashboard requires an authenticated session — there's
// nothing here for search engines to index, and indexing it would mean
// crawlers keep hitting a page that just bounces them to "/" (see
// DashboardShell's redirect for anyone without a session).
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
