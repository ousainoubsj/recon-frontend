import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

export default function TeamAccessCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface-deep/60 p-3">
      <TruncateTooltip as="h3" className="truncate text-sm font-semibold text-foreground" tooltip="Manage access with ease">
        Manage access with ease
      </TruncateTooltip>
      <p className="mt-2 text-sm text-fg-muted">Add users, assign roles, and control permissions across your organization.</p>
    </div>
  )
}
