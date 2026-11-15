import { ShieldCheck } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

export default function AuditSecurityCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface-deep/60 p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-solid/15 text-success">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <TruncateTooltip as="h3" className="truncate text-sm font-semibold text-foreground" tooltip="Enterprise Security">
          Enterprise Security
        </TruncateTooltip>
      </div>
      <p className="mt-3 text-sm text-fg-muted">All activities are securely logged and monitored to ensure data integrity.</p>
    </div>
  )
}
