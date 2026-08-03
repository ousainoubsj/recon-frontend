import type { Metadata } from 'next'
import ReconciliationWizard from '@/components/dashboard/reconcile/ReconciliationWizard'

export const metadata: Metadata = {
  title: 'Reconciliation',
}

export default async function Page({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params
  // key={reportId} forces a full remount on navigating between two
  // different reports rather than reusing the same instance with an updated
  // prop — otherwise this component's local state (selected transaction row,
  // manual step, explorer filter) would leak from the previous report into
  // the new one, which previously surfaced as a spurious 404 ("Resource not
  // found or does not belong to user") when a stale row id from report A got
  // queried against report B.
  return <ReconciliationWizard key={reportId} reportId={reportId} />
}
