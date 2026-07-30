'use client'

import { Check } from 'lucide-react'
import { useWizardStore } from '@/stores/wizard-store'

type Stage = 'mapping' | 'processing' | 'results' | 'explorer'

const STAGES: { key: Stage; label: string }[] = [
  { key: 'mapping', label: 'Column Mapping' },
  { key: 'processing', label: 'Processing' },
  { key: 'results', label: 'Results' },
  { key: 'explorer', label: 'Transaction Explorer' },
]

function currentStage(step: 1 | 2 | 3 | 4, isRunning: boolean): Stage {
  if (isRunning) return 'processing'
  if (step === 3) return 'results'
  if (step === 4) return 'explorer'
  return 'mapping'
}

export default function ReconciliationStepper() {
  const step = useWizardStore((s) => s.step)
  const isRunning = useWizardStore((s) => s.isRunning)
  const stage = currentStage(step, isRunning)
  const currentIndex = STAGES.findIndex((s) => s.key === stage)

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400 text-emerald-400">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <span className="text-white">Upload Files</span>

      {STAGES.map((s, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        return (
          <span key={s.key} className="flex items-center gap-3">
            <span className={isDone || isCurrent ? 'text-emerald-400' : 'text-slate-600'}>&rarr;</span>
            {isDone ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400 text-emerald-400">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : isCurrent ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                {i + 2}
              </span>
            ) : (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-gray-700 text-xs text-slate-300">
                {i + 2}
              </span>
            )}
            <span className={isCurrent ? 'font-semibold text-white' : isDone ? 'text-white' : 'text-slate-300'}>{s.label}</span>
          </span>
        )
      })}
    </div>
  )
}
