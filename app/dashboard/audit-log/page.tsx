import { FileText } from 'lucide-react'
import PlaceholderPage from '@/components/dashboard/PlaceholderPage'

export default function Page() {
  return (
    <PlaceholderPage
      title="Audit Log"
      description="A record of account and reconciliation activity will show up here. This page is coming soon."
      Icon={FileText}
    />
  )
}
