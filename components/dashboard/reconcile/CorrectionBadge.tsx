import { PencilLine } from 'lucide-react'

// Applied: the run used a corrected value. Pending: made here, applied by the next rerun.
export default function CorrectionBadge({ applied }: { applied: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-nowrap ${
        applied ? 'bg-orange-500/15 text-orange-300' : 'border border-dashed border-slate-500/50 text-slate-400'
      }`}
    >
      <PencilLine className="h-3.5 w-3.5" />
      {applied ? 'Corrected' : 'Correction pending'}
    </span>
  )
}
