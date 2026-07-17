import { ArrowRight, ShieldCheck } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

export default function AuditSecurityCard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <TruncateTooltip as="h3" className="truncate text-sm font-semibold text-white" tooltip="Enterprise Security">
          Enterprise Security
        </TruncateTooltip>
      </div>
      <p className="mt-3 text-sm text-slate-400">All activities are securely logged and monitored to ensure data integrity.</p>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/50 py-2.5 text-sm font-medium text-indigo-400"
      >
        Learn More
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
