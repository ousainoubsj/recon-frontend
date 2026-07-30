import ReconciliationWizard from '@/components/dashboard/reconcile/ReconciliationWizard'

export default async function Page({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params
  return <ReconciliationWizard reportId={reportId} />
}
