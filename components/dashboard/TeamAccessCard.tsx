import { ArrowRight } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

export default function TeamAccessCard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <TruncateTooltip as="h3" className="truncate text-sm font-semibold text-white" tooltip="Manage access with ease">
        Manage access with ease
      </TruncateTooltip>
      <p className="mt-2 text-sm text-slate-400">Add users, assign roles, and control permissions across your organization.</p>

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
