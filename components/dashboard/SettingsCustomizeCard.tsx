import { ArrowRight } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="4" x2="5" y2="20" stroke="#2DD4BF" strokeWidth="1.8" />
      <circle cx="5" cy="15" r="2" fill="#2DD4BF" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="#818CF8" strokeWidth="1.8" />
      <circle cx="12" cy="9" r="2" fill="#818CF8" />
      <line x1="19" y1="4" x2="19" y2="20" stroke="#C084FC" strokeWidth="1.8" />
      <circle cx="19" cy="12" r="2" fill="#C084FC" />
    </svg>
  )
}

export default function SettingsCustomizeCard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-4">
      <TruncateTooltip as="h3" className="truncate text-sm font-semibold text-white" tooltip="Customize Your Experience">
        Customize Your Experience
      </TruncateTooltip>

      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#101A33] to-[#1E1440]">
          <SlidersIcon />
        </span>
        <p className="text-sm text-slate-400">Configure system preferences, reconciliation defaults and integrations.</p>
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/50 py-2.5 text-sm font-medium text-indigo-400"
      >
        Explore Settings
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
